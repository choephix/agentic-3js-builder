import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { glow } from "../../../../kits/glow";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Sweep } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Kraken",
  description:
    "A towering kraken heaving itself out of the sea on eight armoured arms, two raised clubbed tentacles, glowing orange panel lines and a crowned head.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: cobalt body with a cream belly, graphite armour, one strong orange accent.
const INDIGO = "#1f2c78";
const BLUE = "#2f66d0";
const SKY = "#63a8f2";
const CREAM = "#f3e9d6";
const GRAPH = "#2a2f3c";
const STEEL = "#7c88a0";
const ORANGE = "#ff7b1c";
const BONE = "#eadcb8";
const FOAM = "#eaf8ff";
const WATER = "#17658a";
const WATER2 = "#2a9cc0";
const SUCK = "#f7dcc9";
const SUCKIN = "#c8685a";
const MOUTH = "#4a1d38";

const WATER_TOP = 0.06;

const cap = (x: number) => ((x % 360) + 360) % 360;
const clockDist = (deg: number) => {
  const d = cap(deg);
  return Math.min(d, 360 - d);
};
const keyed = (keys: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};

// Skin paints -----------------------------------------------------------------------------------------------------
const bodyCoat = paint((p, _n, s) => {
  const t = s[0];
  const dd = clockDist(s[1]);
  const wob = noise(p, 0.7, 3);
  if (Math.abs(dd - 118) < 2.4) return ORANGE;
  if (Math.abs(dd - 58) < 1.6) return CREAM;
  if (dd < 58) {
    const seam = Math.abs(((t * 24) % 1) - 0.5) > 0.485;
    if (seam) return INDIGO;
    return mix(INDIGO, BLUE, smoothstep(0.05, 0.6, t) * 0.8 + wob * 0.25);
  }
  if (dd < 118) return mix(BLUE, SKY, smoothstep(58, 118, dd) * 0.85 + wob * 0.15);
  return mix(CREAM, "#ead7bd", wob * 0.6);
});

const armCoat = paint((p, _n, s) => {
  const t = s[0];
  const dd = clockDist(s[1]);
  const wob = noise(p, 0.5, 9);
  if (Math.abs(dd - 74) < 2.2) return INDIGO;
  if (dd > 74) return mix(CREAM, "#ead7bd", wob * 0.6);
  const dash = dd < 11 && (t * 28) % 1 < 0.4 && t > 0.32 && t < 0.97;
  if (dash) return ORANGE;
  const base = mix(BLUE, SKY, smoothstep(10, 70, dd) * 0.6 + wob * 0.2);
  return mix(base, ORANGE, smoothstep(0.82, 0.98, t));
});

const sleeveCoat = paint((p, _n, s) => {
  const t = s[0];
  const dd = clockDist(s[1]);
  for (const g of [0.15, 0.2, 0.25]) if (Math.abs(t - g) < 0.0045) return INDIGO;
  if (dd < 20) return STEEL;
  return mix(GRAPH, "#3a4152", noise(p, 0.3, 4));
});

const suckerCoat = paint((_p, _n, s) => (s[1] > 0.82 ? SUCKIN : SUCK));

const finCoat = paint((_p, _n, s) => {
  const u = s[0];
  const v = s[1];
  if (u > 1.95) return ORANGE;
  if (Math.abs((((v / 0.3) % 1) + 1) % 1 - 0.5) < 0.05) return CREAM;
  return mix(INDIGO, BLUE, smoothstep(0, 1.9, u));
});

const crestCoat = paint((_p, _n, s) => (s[1] > 0.86 ? ORANGE : mix(GRAPH, INDIGO, s[1])));

// Eye drawing -------------------------------------------------------------------------------------------------------
const EYE = svg(
  `<svg viewBox="0 0 100 100">
    <defs>
      <radialGradient id="ir" cx="50%" cy="46%" r="52%">
        <stop offset="0" stop-color="#fff2a0"/>
        <stop offset="0.45" stop-color="#ffb02a"/>
        <stop offset="0.85" stop-color="#ff6a14"/>
        <stop offset="1" stop-color="#a83a08"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#1b1018"/>
    <circle cx="50" cy="50" r="43" fill="url(#ir)"/>
    <path d="M12 38 Q50 10 88 38" stroke="#a83a08" stroke-width="3" fill="none" opacity="0.7"/>
    <rect x="17" y="40" width="66" height="21" rx="10.5" fill="#150a14"/>
    <ellipse cx="34" cy="35" rx="9" ry="6" fill="#ffffff" transform="rotate(-25 34 35)"/>
    <circle cx="66" cy="66" r="3.6" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

// Sucker cup profile (units of cup radius): buried base, outer wall, rim, inner wall, floor.
const CUP: [number, number][] = [
  [1.05, -0.45],
  [0.98, 0.2],
  [0.8, 0.52],
  [0.55, 0.46],
  [0.42, 0.0],
  [0.0, 0.0],
];
const cupGeo = (r: number) =>
  new THREE.LatheGeometry(
    CUP.map(([x, y]) => new THREE.Vector2(x * r, y * r)),
    7,
  );

export default function build() {
  const b = createBuilder({ name: "kraken", paintSize: 2048 });
  const R = rng(17);

  // ---- Skeleton: core, mantle chain up and back, head chain forward and down -------------------------------------
  const core = b.joint("core", { at: [0, 3.7, -0.5], role: "spine" });
  const bodyPath = catmull([
    [0, 6.75, -2.8],
    [0, 5.9, -2.1],
    [0, 4.9, -1.3],
    [0, 3.7, -0.5],
    [0, 3.3, 0.35],
    [0, 2.85, 1.15],
  ]);
  const rootT = bodyPath.closestT(core.at);
  const mantle = b.chain("mantle", bodyPath.slice(rootT, 0), { parent: core, count: 5, role: "spine" });
  const front = b.chain("front", bodyPath.slice(rootT, 1), { parent: core, count: 2, role: "spine" });
  const headAt = bodyPath.at(rootT + (1 - rootT) * 0.62);
  const head = b.joint("head", {
    parent: front.joints[1],
    at: headAt,
    aim: bodyPath.at(1),
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.34, 0.95], aim: [0, 1.72, 1.4], role: "jaw" });

  // ---- Water base ---------------------------------------------------------------------------------------------------
  b.lathe(
    [
      [0, -0.14],
      [8.7, -0.14],
      [8.7, 0.02],
      [8.35, WATER_TOP],
      [0, WATER_TOP],
    ],
    { at: [0, 0, 0], bone: core, segments: 28, color: WATER, name: "water" },
  );
  for (const [r0, r1] of [
    [1.9, 2.15],
    [3.3, 3.5],
    [5.6, 5.85],
    [7.3, 7.5],
  ])
    b.lathe(
      [
        [r0, WATER_TOP - 0.02],
        [r1, WATER_TOP - 0.02],
        [r1, WATER_TOP + 0.03],
        [r0, WATER_TOP + 0.03],
      ],
      { at: [0, 0, 0], bone: core, segments: 28, color: WATER2, name: "wave" },
    );
  {
    const blobs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 44; i++) {
      const a = R() * Math.PI * 2;
      const rr = 2.2 + R() * 6;
      const s = 0.1 + R() * 0.22;
      blobs.push(
        new THREE.SphereGeometry(s, 6, 4)
          .scale(1.5, 0.28, 1)
          .rotateY(R() * 3)
          .translate(Math.sin(a) * rr, WATER_TOP + 0.01, Math.cos(a) * rr),
      );
    }
    b.part(mergeGeometries(blobs)!, FOAM, { bone: core, at: [0, 0, 0], name: "foamBlobs" });
  }
  for (const [rad, h] of [
    [4.6, 0.11],
    [6.4, 0.09],
  ]) {
    const pts: number[][] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const rr = rad + Math.sin(i * 2.3) * 0.22;
      pts.push([Math.sin(a) * rr, WATER_TOP + h * 0.5, Math.cos(a) * rr]);
    }
    b.sweep(catmull(pts, { closed: true }), [0.13, 0.05], { bone: core, color: FOAM, sides: 5, name: "foamRing" });
  }

  // ---- Body: one skinned tube over mantle, core and neck ------------------------------------------------------------
  const radii = [0.05, 0.55, 0.95, 1.2, 1.3, 1.22, 1.1, 0.95, 0.66];
  const body = b.sweep(bodyPath, radii, {
    bone: [mantle, core, front, head],
    color: bodyCoat,
    sides: 14,
    name: "body",
  });
  const skin = b.surface(body);

  // Collar rings at the neck: graphite band with glowing inner seam.
  const collarT = 0.66;
  const collarLoop = skin.loop(bodyPath.at(collarT), { dir: bodyPath.tangentAt(collarT), lift: 0.04 });
  b.sweep(collarLoop, [0.11, 0.07], { color: GRAPH, sides: 6, name: "collar" });
  const collarB = skin.loop(bodyPath.at(collarT - 0.035), { dir: bodyPath.tangentAt(collarT - 0.035), lift: 0.02 });
  glow(b.sweep(collarB, 0.04, { color: ORANGE, sides: 5, name: "collarGlow" }), 1.3);

  // Glowing rings round the mantle.
  for (const t of [0.14, 0.22, 0.3, 0.38, 0.46]) {
    const loop = skin.loop(bodyPath.at(t), { dir: bodyPath.tangentAt(t), lift: 0.015 });
    glow(b.sweep(loop, 0.028, { color: ORANGE, sides: 4, name: "mantleRing" }), 1.2);
  }

  // Armour plates along both flanks of the mantle.
  for (const t of [0.11, 0.18, 0.25, 0.32, 0.39, 0.46, 0.53]) {
    for (const deg of [76, 284]) {
      const at = body.at(t, deg);
      const rad = Math.max(at.radius * 0.5, 0.1);
      b.stick(new THREE.CylinderGeometry(rad, rad * 1.1, 0.13, 6), GRAPH, at, { embed: 0.45, flat: true });
      glow(
        b.stick(new THREE.CylinderGeometry(rad * 0.5, rad * 0.55, 0.15, 6), ORANGE, at, { embed: 0.42, flat: true }),
        1.1,
      );
    }
  }

  // Dorsal crest down the mantle.
  {
    const lows: number[][] = [];
    const highs: number[][] = [];
    const N = 9;
    for (let i = 0; i <= N; i++) {
      const t = 0.07 + (rootT - 0.1) * (i / N);
      const h = 0.15 + 0.85 * Math.sin((Math.PI * (i + 0.5)) / (N + 1));
      lows.push(body.at(t, 0, -0.06).at.toArray());
      highs.push(body.at(t, 0, h).at.toArray());
    }
    b.membrane(lows, highs, { color: crestCoat, thickness: 0.07, bone: mantle, name: "crest", rows: 3 });
    glow(b.sweep(highs, 0.035, { bone: mantle, color: ORANGE, sides: 4, name: "crestGlow" }), 1.2);
  }

  // Wing fins at the back of the mantle.
  for (const s of [1, -1]) {
    const t = 0.2;
    const at = bodyPath.at(t);
    const T = bodyPath.tangentAt(t);
    const out = [s, 0.18, 0];
    const along: [number, number, number] = [-T.x, -T.y, -T.z];
    b.extrude(
      [
        [0.5, -0.8],
        [1.5, -0.55],
        [2.35, 0.05, "sharp"],
        [1.85, 0.95],
        [0.9, 1.25],
        [0.5, 0.9],
      ],
      { at, x: out, y: along, thickness: [0.1, 0.03], bevel: 0.025, smoothing: 1, color: finCoat, bone: mantle, name: "fin" },
    );
  }

  // ---- Head ---------------------------------------------------------------------------------------------------------
  const hc = bodyPath.at(0.8);
  // Soft skirt where the arms root.
  b.part(new THREE.SphereGeometry(1, 12, 8), "#4781de", {
    at: [0, 2.38, 0.55],
    scale: [1.3, 0.55, 1.3],
    bone: front.joints[1],
    name: "skirt",
  });

  // Eyes.
  for (const s of [1, -1]) {
    const hit = skin.around(hc).at(s * 62, 6)!;
    const eyeAt = hit.at.clone().addScaledVector(hit.n, 0.13);
    const ball = b.stick(new THREE.SphereGeometry(0.44, 10, 8), CREAM, hit, { embed: 0.35, name: "eyeball" });
    b.stick(new THREE.TorusGeometry(0.47, 0.07, 5, 10).rotateX(Math.PI / 2), GRAPH, hit, { embed: 0.15, name: "eyeRim" });
    glow(
      b.decal(ball, EYE, {
        at: eyeAt.clone().addScaledVector(hit.n, 0.44),
        dir: hit.n.toArray(),
        size: [0.64, 0.64],
        segments: 8,
        name: "iris",
      }),
      1.2,
    );
    // Brow plate with a glowing strip.
    const browHit = skin.around(hc).at(s * 56, 38)!;
    const plate = b.stick(new THREE.BoxGeometry(0.42, 0.14, 0.9), GRAPH, browHit, { embed: 0.3, flow: [0, 0, 1], name: "brow" });
    glow(
      b.stick(new THREE.BoxGeometry(0.07, 0.06, 0.74), ORANGE, plate.moved([0, 0.08, 0]), { embed: 0.4, name: "browGlow" }),
      1.2,
    );
  }

  // Crown horns.
  for (const s of [1, -1]) {
    for (const [az, el, h, f] of [
      [26, 70, 1.35, 0.55],
      [48, 50, 0.85, 0.3],
    ]) {
      const hit = skin.around(hc).at(s * az, el)!;
      const base = hit.at;
      const tip = [base.x + s * 0.5, base.y + h, base.z + f + 0.2];
      const ctrl = [base.x + s * 0.2, base.y + h * 0.7, base.z - 0.1];
      b.sweep(bezier(hit, ctrl, tip), [0.17 * (h / 1.3) + 0.04, 0], {
        color: BONE,
        bands: [
          [0.6, BONE],
          [1, ORANGE],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
        name: "horn",
      });
    }
  }

  // Mouth and beak.
  b.part(new THREE.SphereGeometry(1, 8, 6), MOUTH, { at: [0, 2.12, 0.85], scale: [0.55, 0.3, 0.55], bone: head, name: "mouth" });
  b.sweep(bezier([0, 2.5, 0.8], [0, 2.2, 1.45], [0, 1.55, 1.25]), (t) => [0.3 * (1 - t) + 0.03, 0.24 * (1 - t) + 0.03], {
    bone: head,
    color: GRAPH,
    caps: { start: "flat", end: "point" },
    sides: 6,
    name: "beakUpper",
  });
  b.sweep(bezier([0, 2.3, 1.0], [0, 1.95, 1.55], [0, 1.75, 1.45]), (t) => [0.22 * (1 - t) + 0.03, 0.17 * (1 - t) + 0.03], {
    bone: jaw,
    color: STEEL,
    caps: { start: "flat", end: "point" },
    sides: 6,
    name: "beakLower",
  });

  // ---- Arms and tentacles --------------------------------------------------------------------------------------------
  const CA = new THREE.Vector3(0, 2.4, 0.55);
  const armKeys = [0.42, 0.36, 0.3, 0.24, 0.19, 0.14, 0.1, 0.065, 0.03];
  const tentKeys = [0.34, 0.26, 0.19, 0.14, 0.11, 0.1, 0.16, 0.22, 0.14];
  const armTable = [
    [0.45, 2.4],
    [1.4, 2.1],
    [2.4, 1.45],
    [3.5, 0.8],
    [4.6, 0.38],
    [5.7, 0.12],
    [6.7, 0.3],
    [7.3, 0.85],
  ];
  const tentTable = [
    [0.5, 2.7],
    [1.6, 2.8],
    [2.8, 3.3],
    [3.7, 4.2],
    [4.4, 5.2],
    [4.6, 6.1],
    [4.2, 6.8],
    [3.6, 7.0],
  ];

  function dress(
    name: string,
    chain: ReturnType<typeof b.chain>,
    rfn: (t: number) => number,
    ts: number[],
    mainSweep: Sweep,
    sleeve: [number, number],
  ) {
    // Gauntlet sleeve plus glowing end rings.
    b.sweep(chain, (t) => rfn(t) + 0.05, { from: sleeve[0], to: sleeve[1], caps: "flat", color: sleeveCoat, sides: 8, name: `${name}Sleeve` });
    for (const t0 of [sleeve[0], sleeve[1] - 0.015])
      glow(
        b.sweep(chain, (t) => rfn(t) + 0.075, { from: t0, to: t0 + 0.015, caps: "flat", color: ORANGE, sides: 8, name: `${name}Ring` }),
        1.2,
      );
    // Two staggered rows of suckers on the flanks.
    ts.forEach((t, i) => {
      for (const deg of [112, 248]) {
        const tt = deg === 112 ? t : Math.min(t + 0.03, 0.97);
        const at = mainSweep.at(tt, deg);
        const rc = Math.max(rfn(tt) * 0.66, 0.03);
        b.stick(cupGeo(rc), suckerCoat, at, { embed: 0, flat: true, name: `${name}Sucker` });
        void i;
      }
    });
  }

  type Spec = { name: string; side: number; theta: number; len: number; wob: number; phase: number; curl: number };
  const specs: Spec[] = [];
  const thetas = [28, 62, 126, 160];
  const lens = [1.0, 1.02, 0.94, 0.88];
  const wobs = [0.55, -0.7, 0.8, -0.5];
  const curls = [1.15, 0.75, 1.0, 1.5];
  for (const side of [1, -1])
    thetas.forEach((th, i) =>
      specs.push({
        name: `arm${side > 0 ? "L" : "R"}${i + 1}`,
        side,
        theta: th,
        len: lens[i] * (side > 0 ? 1 : 0.96),
        wob: wobs[i] * (side > 0 ? 1 : -0.85),
        phase: i * 1.3 + (side > 0 ? 0 : 2),
        curl: curls[i] * (side > 0 ? 1 : 0.9),
      }),
    );

  for (const sp of specs) {
    const th = (sp.side * sp.theta * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    const perp = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    const rfn = (t: number) => keyed(armKeys, t);
    const raw = armTable.map(([rho, y], i) => {
      const r = 0.45 + (rho - 0.45) * sp.len;
      const lat = sp.wob * Math.sin(i * 0.85 + sp.phase) * smoothstep(0.15, 1, r / 7);
      const p = CA.clone().addScaledVector(d, r).addScaledVector(perp, lat);
      p.y = i >= armTable.length - 2 ? y * sp.curl : y;
      return p;
    });
    // Keep the arm lying on the water: raise y to the tube's own radius there.
    const lens3 = [0];
    for (let i = 1; i < raw.length; i++) lens3.push(lens3[i - 1] + raw[i].distanceTo(raw[i - 1]));
    raw.forEach((p, i) => {
      if (i >= 3) p.y = Math.max(p.y, rfn(lens3[i] / lens3[lens3.length - 1]) + WATER_TOP + 0.005);
    });
    const chain = b.chain(sp.name, catmull(raw), {
      parent: front.joints[1],
      names: (i) => `${sp.name}_${i + 1}`,
      role: "tentacle",
    });
    const sw = b.sweep(chain, rfn, { color: armCoat, sides: 8, name: sp.name });
    const ts: number[] = [];
    for (let k = 0; k < 9; k++) ts.push(0.36 + k * 0.065);
    dress(sp.name, chain, rfn, ts, sw, [0.1, 0.3]);
  }

  // Raised feeding tentacles with clubs.
  for (const side of [1, -1]) {
    const name = `tentacle${side > 0 ? "L" : "R"}`;
    const th = (side * 92 * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    const perp = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th));
    const pts = tentTable.map(([rho, y], i) => {
      const lat = 0.35 * Math.sin(i * 0.9 + (side > 0 ? 0 : 2.1)) * smoothstep(0.15, 1, rho / 4.5);
      return CA.clone().addScaledVector(d, rho).addScaledVector(perp, lat).setY(y);
    });
    const rfn = (t: number) => keyed(tentKeys, t);
    const chain = b.chain(name, catmull(pts), {
      parent: front.joints[1],
      names: (i) => `${name}_${i + 1}`,
      role: "tentacle",
    });
    const sw = b.sweep(chain, rfn, { color: armCoat, sides: 8, name });
    const ts: number[] = [];
    for (let k = 0; k < 6; k++) ts.push(0.34 + k * 0.06);
    for (let k = 0; k < 3; k++) ts.push(0.7 + k * 0.08);
    dress(name, chain, rfn, ts, sw, [0.08, 0.26]);
    // Barbs on the club tip.
    for (const deg of [60, 180, 300]) b.spike(sw.at(0.98, deg), sw.at(0.98, deg), 0.28, 0.05, { color: BONE, name: `${name}Barb` });
  }

  return b.root;
}
