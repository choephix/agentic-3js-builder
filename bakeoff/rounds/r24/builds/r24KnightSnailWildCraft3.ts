// STYLE: "Delftware" — the whole scene is a hand-painted Dutch tin-glaze porcelain figurine.
// Glossy white glaze, cobalt-blue brushwork (tulips, spirals, harlequin diamonds, scale-hatching),
// and tiny touches of gilt lustre on rivets, rims and spurs. No other hues anywhere.
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  svg,
  paint,
  mix,
  smoothstep,
  noise,
  scales,
  countershade,
  stripes,
} from "../../../../src/index";
import type { Joint, PointInput } from "../../../../src/index";

export const meta = {
  name: "Delft Knight on a Snail",
  description:
    "A knight couching a painted lance atop a giant snail, rendered as a blue-and-white Delftware porcelain figurine with gilt lustre accents.",
};

type P3 = [number, number, number];
type Pt2 = [number, number] | [number, number, "sharp"];
type Col = string | ReturnType<typeof paint>;

const TAU = Math.PI * 2;
const fract = (x: number) => x - Math.floor(x);
const add3 = (a: P3, d: P3, k: number): P3 => [a[0] + d[0] * k, a[1] + d[1] * k, a[2] + d[2] * k];
const sub3 = (a: P3, c: P3): P3 => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const unit3 = (a: P3): P3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// ---------- palette ----------
const GLAZE = "#f8f6ee";
const COBALT = "#1f43a3";
const DEEP = "#0f2468";
const NAVY = "#0a1648";
const MIDB = "#3d63bf";
const SKYB = "#8fabe0";
const PALEB = "#c9d6f0";
const GOLD = "#e2ae3e";

// ---------- SVG helpers ----------
const spiralD = (cx: number, cy: number, r0: number, r1: number, turns: number, steps = 56) => {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * TAU;
    const r = r0 + (r1 - r0) * t;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} `;
  }
  return d;
};

const tulip = (x: number, y: number, sc: number) => `
<g transform="translate(${x} ${y}) scale(${sc})">
  <path d="M0 0 V-30" stroke="${COBALT}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M0 -4 Q-14 -8 -12 -26 Q-2 -18 0 -4Z" fill="${MIDB}" stroke="${DEEP}" stroke-width="1.2"/>
  <path d="M0 -6 Q12 -10 11 -22 Q3 -16 0 -6Z" fill="${SKYB}" stroke="${DEEP}" stroke-width="1.2"/>
  <path d="M-9 -30 L-10 -44 L-4 -38 L0 -48 L4 -38 L10 -44 L9 -30 Q0 -21 -9 -30Z" fill="${COBALT}" stroke="${DEEP}" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M0 -47 V-28" stroke="${PALEB}" stroke-width="1.4"/>
</g>`;

const snailMark = () => `
<path d="M-30 20 Q-30 10 -18 10 L14 10 Q26 10 27 -2 Q28 -12 24 -20" fill="none" stroke="${COBALT}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="-5" cy="-6" r="19" fill="${GLAZE}" stroke="${COBALT}" stroke-width="4"/>
<path d="${spiralD(-5, -6, 1.5, 14, 2.4)}" fill="none" stroke="${MIDB}" stroke-width="3" stroke-linecap="round"/>
<path d="M24 -20 L20 -34 M29 -18 L38 -30" stroke="${COBALT}" stroke-width="3" stroke-linecap="round"/>
<circle cx="20" cy="-35" r="3.5" fill="${COBALT}"/><circle cx="38.5" cy="-31" r="3.5" fill="${COBALT}"/>
<circle cx="26" cy="-9" r="2" fill="${GLAZE}"/>`;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "delft-knight-snail", paintSize: 2048 });

  // ---------- textures ----------
  const EYE = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="29" fill="${GLAZE}" stroke="${DEEP}" stroke-width="4"/>
      <circle cx="35" cy="33" r="17" fill="${MIDB}"/>
      <circle cx="35" cy="33" r="17" fill="none" stroke="${DEEP}" stroke-width="2.5"/>
      <circle cx="36" cy="34" r="8.5" fill="${NAVY}"/>
      <circle cx="29" cy="26" r="5" fill="#ffffff"/>
      <circle cx="42" cy="41" r="2.4" fill="#ffffff"/>
      <path d="M8 22 Q24 6 50 9" stroke="${DEEP}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const CHEEK = svg(
    `<svg viewBox="0 0 64 64">
      <path d="${spiralD(32, 32, 2, 24, 2.2)}" fill="none" stroke="${COBALT}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="8" cy="54" r="3.2" fill="${COBALT}"/><circle cx="56" cy="10" r="3.2" fill="${COBALT}"/>
    </svg>`,
    { size: 128 },
  );
  const SHIELD = svg(
    `<svg viewBox="0 0 58 92">
      <path d="M2 2 H56 V32 Q56 64 29 90 Q2 64 2 32 Z" fill="${GLAZE}" stroke="${COBALT}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M8 8 H50 V32 Q50 58 29 80 Q8 58 8 32Z" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
      <g transform="translate(29 38) scale(0.6)">${snailMark()}</g>
      ${tulip(15, 80, 0.32)}${tulip(43, 80, 0.32)}
    </svg>`,
    { size: 256 },
  );
  const TABARD = svg(
    `<svg viewBox="0 0 70 80">
      <circle cx="35" cy="40" r="33" fill="${GLAZE}" stroke="${COBALT}" stroke-width="3.5"/>
      <circle cx="35" cy="40" r="28" fill="none" stroke="${MIDB}" stroke-width="1.5" stroke-dasharray="2 3.4"/>
      <g transform="translate(35 46) scale(0.7)">${snailMark()}</g>
    </svg>`,
    { size: 256 },
  );
  const FLANK = svg(
    `<svg viewBox="0 0 100 80">
      <ellipse cx="50" cy="40" rx="46" ry="37" fill="${GLAZE}" stroke="${COBALT}" stroke-width="4"/>
      <ellipse cx="50" cy="40" rx="39" ry="30" fill="none" stroke="${MIDB}" stroke-width="1.6" stroke-dasharray="1.5 3.5"/>
      ${tulip(50, 62, 0.95)}${tulip(30, 64, 0.6)}${tulip(70, 64, 0.6)}
      <path d="M26 66 Q50 74 74 66" stroke="${COBALT}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  let breaths = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 6; c++)
      breaths += `<circle cx="${30 + c * 8 + (r % 2) * 4}" cy="${34 + r * 7}" r="1.9" fill="${NAVY}"/>`;
  const VISOR = svg(
    `<svg viewBox="0 0 100 56">
      <path d="M50 0 V12 M50 26 V56" stroke="${GOLD}" stroke-width="3.2"/>
      <rect x="8" y="10" width="84" height="15" rx="7.5" fill="${NAVY}"/>
      <circle cx="33" cy="17.5" r="4.6" fill="#ffffff"/><circle cx="67" cy="17.5" r="4.6" fill="#ffffff"/>
      <circle cx="34.5" cy="18" r="2.3" fill="${COBALT}"/><circle cx="65.5" cy="18" r="2.3" fill="${COBALT}"/>
      ${breaths}
    </svg>`,
    { size: 192 },
  );
  let barbs = "";
  for (let y = 16; y < 100; y += 9)
    barbs += `<path d="M20 ${y} L4 ${y - 11} M20 ${y} L36 ${y - 11}" stroke="${y < 52 ? PALEB : COBALT}" stroke-width="1.6" fill="none"/>`;
  const FEATHER = svg(
    `<svg viewBox="0 0 40 110">
      <path d="M20 108 C2 80 0 40 20 2 C40 40 38 80 20 108Z" fill="${GLAZE}" stroke="${DEEP}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 3 C9 20 4 36 3.5 52 L36.5 52 C36 36 31 20 20 3Z" fill="${MIDB}"/>
      ${barbs}
      <path d="M20 108 V6" stroke="${DEEP}" stroke-width="2.6"/>
    </svg>`,
    { size: 192 },
  );

  // ---------- paints ----------
  const wash = (a: string, c: string, seed: number, size = 0.15) =>
    paint((p, n) => {
      const t = smoothstep(0.3, 0.7, noise(p, size, seed));
      const base = mix(a, c, t);
      const lit = smoothstep(0.2, 0.95, n.y) * 0.3;
      const under = smoothstep(0.0, -0.8, n.y) * 0.25;
      return mix(mix(base, "#a9c0ee", lit), NAVY, under);
    });
  const GLAZE_P = paint((p, n) => {
    const dim = smoothstep(0.35, -0.9, n.y) * 0.55;
    const craze = smoothstep(0.62, 0.8, noise(p, 0.05, 3)) * 0.12;
    return mix(mix(GLAZE, "#d9e3f4", dim), PALEB, craze);
  });
  const ARMOR = wash("#244aa8", "#1a3a8c", 4, 0.16);
  const ARMOR_D = wash("#16307a", "#1f43a3", 5, 0.12);
  const PLATE_L = wash(SKYB, "#6b8cd4", 6, 0.1);
  const SKIN = countershade(
    scales(GLAZE, "#6f8fd4", { size: 0.08, width: 0.09, seed: 2 }),
    "#a9bde6",
    { level: -0.5, soft: 0.3 },
  );
  const SHELL_P = paint((_p, n, s) => {
    const t = s[0];
    const fl = Math.acos(Math.min(1, Math.abs(n.x))) * 57.2958;
    const c = mix(GLAZE, "#cfdcf3", Math.min(1, t * 0.7 + smoothstep(0.35, -0.8, n.y) * 0.3));
    if (fl < 7) return COBALT;
    if (Math.abs(fl - 34) < 3.5) return MIDB;
    if (fl > 80) return DEEP;
    if (fract(t * 38) < 0.09 && fl > 12 && fl < 70) return SKYB;
    return mix(c, COBALT, smoothstep(0.82, 0.95, t));
  });
  const SKIRT_P = paint((_p, _n, s) => (s[0] < -0.15 ? COBALT : s[0] < -0.12 ? GOLD : GLAZE_P));
  const HELM_P = paint((p, n, s) => {
    if (Math.abs(s[0] - 0.05) < 0.008 || Math.abs(s[0] + 0.1) < 0.008) return GLAZE;
    return ARMOR.at(p, n);
  });
  const PENNON_P = paint((_p, _n, s) => (s[0] < 0.05 ? GOLD : Math.floor(s[0] / 0.11) & 1 ? COBALT : GLAZE));
  const CAPE_P = paint((_p, _n, s) => {
    if (s[0] > 0.93) return GOLD;
    if (s[0] > 0.84) return COBALT;
    const a = s[0] * 6;
    const c = s[1] * 5;
    const x = Math.min(fract(a + c), 1 - fract(a + c), fract(a - c), 1 - fract(a - c));
    if (x < 0.06) return MIDB;
    return GLAZE_P;
  });
  const LANCE_P = stripes(GLAZE, COBALT, { size: 0.16, axis: unit3([0.6, 0.6, 2.2]), width: 0.5, wobble: 0 });

  // ---------- small helpers ----------
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const blob = (color: Col, at: PointInput, sc: [number, number, number], bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { at, bone, scale: sc, flat: true });
  const band = (color: string, r: number, h: number) => new THREE.CylinderGeometry(r, r, h, 8);

  // =====================================================================
  //  SNAIL — skeleton first
  // =====================================================================
  const ST: { z: number; y: number; rx: number; ry: number }[] = [
    { z: -2.15, y: 0.035, rx: 0.02, ry: 0.035 },
    { z: -1.7, y: 0.13, rx: 0.15, ry: 0.13 },
    { z: -1.1, y: 0.26, rx: 0.36, ry: 0.26 },
    { z: -0.35, y: 0.31, rx: 0.45, ry: 0.31 },
    { z: 0.35, y: 0.31, rx: 0.46, ry: 0.31 },
    { z: 1.0, y: 0.32, rx: 0.42, ry: 0.32 },
    { z: 1.4, y: 0.44, rx: 0.31, ry: 0.28 },
    { z: 1.65, y: 0.68, rx: 0.24, ry: 0.22 },
    { z: 1.8, y: 0.88, rx: 0.22, ry: 0.22 },
  ];
  const body = catmull(ST.map((s): P3 => [0, s.y, s.z]));
  const sts = ST.map((s) => ({ ...s, t: body.closestT([0, s.y, s.z]) }));
  const rBody = (t: number): [number, number] => {
    let i = 0;
    while (i < sts.length - 2 && t > sts[i + 1].t) i++;
    const a = sts[i];
    const c = sts[i + 1];
    const lin = Math.min(1, Math.max(0, (t - a.t) / (c.t - a.t)));
    const k = 0.5 * lin + 0.5 * smoothstep(0, 1, lin);
    return [a.rx + (c.rx - a.rx) * k, a.ry + (c.ry - a.ry) * k];
  };

  const core = b.joint("core", { at: [0, 0.31, 0], dir: [0, 0, 1], role: "spine" });
  const rootT = body.closestT(core.at);
  const neckT = sts[7].t;
  const spine = b.chain("spine", body.slice(rootT, neckT), { parent: core, count: 4, role: "spine" });
  const neck = b.chain("neck", body.slice(neckT, 1), {
    parent: spine.joints[spine.joints.length - 1],
    count: 2,
    role: "neck",
  });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: core, count: 6, role: "tail" });

  const bodyS = b.sweep(body, rBody, { bone: [tail, core, spine, neck], color: SKIN, sides: 12 });

  // painted wave lines low on the flanks (gilt lustre + cobalt)
  b.sweep(bodyS.line(104, 0.004), 0.011, { color: COBALT, sides: 6 });
  b.sweep(bodyS.line(256, 0.004), 0.011, { color: COBALT, sides: 6 });
  b.sweep(bodyS.line(122, 0.004), 0.006, { color: GOLD, sides: 6 });
  b.sweep(bodyS.line(238, 0.004), 0.006, { color: GOLD, sides: 6 });

  // cobalt polka dots on bare skin
  const bodySkin = b.surface(bodyS);
  for (const hit of bodySkin.scatter(46, {
    rng: rng(3),
    minDist: 0.11,
    filter: (h) =>
      h.n.y > -0.1 && h.at.z < 1.5 && h.at.z > -2.0 && !(h.at.z > -0.35 && h.at.z < 1.12 && h.n.y > 0.1),
  }))
    b.stick(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 8), COBALT, hit, { embed: 0.5 });

  // ---------- caparison (harlequin barding) ----------
  const capA = body.closestT([0, 0.31, -0.3]);
  const capB = body.closestT([0, 0.32, 1.08]);
  const capS = b.sweep(
    body,
    (t) => {
      const [rx, ry] = rBody(t);
      return [rx + 0.03, ry + 0.03];
    },
    {
      from: capA,
      to: capB,
      shift: [0, 0.03],
      bone: [tail, core, spine, neck],
      color: paint((_p, _n, s) => {
        const a = (s[0] * body.length) / 0.21;
        const d = (s[1] / 360) * 8;
        const i = Math.floor(a + d);
        const j = Math.floor(a - d);
        const e = Math.min(fract(a + d), 1 - fract(a + d), fract(a - d), 1 - fract(a - d));
        if (e < 0.05) return GOLD;
        return (i + j) & 1 ? ARMOR : GLAZE_P;
      }),
      caps: "flat",
      sides: 12,
    },
  );
  const capSkin = b.surface(capS);
  for (const z of [-0.24, 1.02]) {
    const loop = capSkin.loop([0, 0.33, z], { dir: [0, 0, 1], lift: 0.008 });
    b.sweep(loop, 0.02, { color: COBALT, sides: 6 });
    b.along(loop, 18, (at) => b.stick(ball(0.017, 6, 4), GOLD, at, { embed: 0.3 }));
  }
  for (const s of [1, -1])
    b.decal(capS, FLANK, { at: [s * 0.49, 0.34, 0.25], dir: [s, 0, 0], size: [0.6, 0.48], segments: 14 });

  // ---------- spiral shell ----------
  const SHELL_C: P3 = [0, 1.1, -0.95];
  const shellJ = b.joint("shell", { parent: core, at: SHELL_C, dir: [1, 0, 0] });
  const R0 = 0.55;
  const NP = 72;
  const spiralPts: P3[] = [];
  const spiralR: number[] = [];
  for (let i = 0; i <= NP; i++) {
    const t = i / NP;
    const ang = -0.9 + t * 2.6 * TAU;
    const R = R0 * Math.exp(-1.75 * t);
    spiralR.push(R);
    spiralPts.push([SHELL_C[0] + 0.3 * t, SHELL_C[1] + R * Math.sin(ang), SHELL_C[2] + R * Math.cos(ang)]);
  }
  const cum: number[] = [0];
  for (let i = 1; i < spiralPts.length; i++) {
    const d = sub3(spiralPts[i], spiralPts[i - 1]);
    cum.push(cum[i - 1] + Math.hypot(d[0], d[1], d[2]));
  }
  const rShell = (t: number): [number, number] => {
    const target = t * cum[cum.length - 1];
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const f = Math.min(1, Math.max(0, (target - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)));
    const R = spiralR[i - 1] + (spiralR[i] - spiralR[i - 1]) * f;
    return [0.46 * R, 0.42 * R];
  };
  const shellS = b.sweep(catmull(spiralPts), rShell, {
    bone: shellJ,
    color: SHELL_P,
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "point" },
  });
  const ridge = shellS.line(180, 0.004);
  b.sweep(ridge, 0.012, { color: GOLD, sides: 6, bone: shellJ });
  b.along(ridge.slice(0, 0.5), 16, (at) => b.stick(ball(0.026, 6, 4), GOLD, at, { embed: 0.4 }));

  // ---------- snail head ----------
  const snailHead = b.joint("snailHead", {
    parent: neck.joints[neck.joints.length - 1],
    at: body.at(1),
    dir: [0, 0.15, 1],
    role: "head",
  });
  const SHL = (f: number, u: number, l = 0) => snailHead.local({ forward: f, up: u, left: l });
  const snailJaw = b.joint("snailJaw", {
    parent: snailHead,
    at: SHL(0.1, -0.06),
    aim: SHL(0.45, -0.06),
    role: "jaw",
  });

  const cranium = blob(SKIN, SHL(0.16, 0.1), [0.21, 0.2, 0.26], snailHead);
  blob(SKIN, SHL(0.3, -0.01), [0.17, 0.09, 0.2], snailHead); // upper lip / muzzle
  blob(NAVY, SHL(0.28, -0.05), [0.14, 0.045, 0.18], snailHead); // mouth interior
  blob(SKIN, SHL(0.27, -0.11), [0.15, 0.065, 0.19], snailJaw); // lower jaw
  blob(SKYB, SHL(0.26, -0.075), [0.08, 0.025, 0.12], snailJaw); // tongue
  for (const s of [1, -1]) {
    b.decal(cranium, CHEEK, { at: SHL(0.2, 0.04, s * 0.2), dir: [s, 0, 0.3], size: [0.13, 0.13], segments: 8 });
    b.part(ball(0.014, 5, 4), NAVY, { at: SHL(0.46, 0.04, s * 0.05), bone: snailHead }); // nostrils
  }
  // bridle band + brow boss
  const hband = b.surface(cranium).loop(SHL(0.1, 0.1), { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(hband, 0.016, { color: COBALT, sides: 6 });
  b.along(hband, 12, (at) => b.stick(ball(0.016, 6, 4), GOLD, at, { embed: 0.3 }));
  const brow = b.surface(cranium).nearest(SHL(0.3, 0.28));
  const bossPlate = b.stick(new THREE.CylinderGeometry(0.07, 0.07, 0.022, 8), GOLD, brow, { embed: 0.3 });
  b.stick(ball(0.035, 6, 5), COBALT, brow.moved([0, 0.02, 0]), { embed: 0.1 });

  // eye stalks + feelers
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = [SHL(0.14, 0.22, 0.1 * s), SHL(0.2, 0.42, 0.17 * s), SHL(0.28, 0.62, 0.23 * s), SHL(0.34, 0.78, 0.27 * s)];
    const st = b.chain(`stalk${sd}`, catmull(pts), { parent: snailHead, count: 3, role: "tentacle" });
    b.sweep(st, [0.058, 0.036], { color: SKIN, sides: 8 });
    b.part(band(GOLD, 0.052, 0.03), GOLD, { frame: st.at(0.5) });
    b.part(band(COBALT, 0.05, 0.02), COBALT, { frame: st.at(0.25) });
    const tipJ = st.joints[st.joints.length - 1];
    const bulb = blob(GLAZE_P, pts[3], [0.088, 0.088, 0.088], tipJ);
    b.decal(bulb, EYE, {
      at: [pts[3].x + s * 0.02, pts[3].y + 0.01, pts[3].z + 0.088],
      dir: [s * 0.25, 0.1, 1],
      size: [0.12, 0.12],
      segments: 8,
    });
    const fp = [SHL(0.34, 0.0, 0.1 * s), SHL(0.48, -0.07, 0.16 * s), SHL(0.6, -0.12, 0.2 * s)];
    const fl = b.chain(`feeler${sd}`, catmull(fp), { parent: snailHead, count: 2, role: "tentacle" });
    b.sweep(fl, [0.04, 0.024], { color: SKIN, sides: 6 });
    blob(SKYB, fp[2], [0.04, 0.04, 0.04], fl.joints[fl.joints.length - 1]);
  }

  // saddle
  blob(GLAZE_P, [0, 0.7, 0.36], [0.3, 0.07, 0.3], core);
  blob(ARMOR, [0, 0.85, 0.12], [0.29, 0.15, 0.05], core);
  b.part(ball(0.045, 8, 6), GOLD, { at: [0, 0.82, 0.66], bone: core });
  b.rod([0, 0.76, 0.62], [0, 0.8, 0.66], 0.03, GOLD, { bone: core });

  // =====================================================================
  //  KNIGHT
  // =====================================================================
  const seatBone = spine.nearestJoint([0, 0.7, 0.42]);
  const pelvis = b.joint("pelvis", { parent: seatBone, at: [0, 0.84, 0.42], dir: [0, 1, 0], role: "spine" });
  const kspine = b.chain(
    "kspine",
    catmull([
      [0, 0.84, 0.4],
      [0, 1.22, 0.46],
      [0, 1.46, 0.49],
    ]),
    { parent: pelvis, role: "spine", count: 2 },
  );
  const chestJ = kspine.joints[1];
  const neckK = b.joint("neck", { parent: chestJ, at: [0, 1.46, 0.49], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neckK, at: [0, 1.58, 0.5], dir: [0, 1, 0.15], role: "head" });
  const visorJ = b.joint("visor", { parent: head, at: [0, 1.72, 0.6], dir: [0, 0, 1], role: "hinge" });

  // torso: white surcoat over cobalt plate
  const torso = b.loft(
    [
      { at: [0, 0.84, 0.4], w: 0.42, h: 0.28 },
      { at: [0, 1.0, 0.43], w: 0.38, h: 0.25 },
      { at: [0, 1.22, 0.46], w: 0.52, h: 0.32 },
      { at: [0, 1.38, 0.48], w: 0.52, h: 0.27 },
      { at: [0, 1.47, 0.49], w: 0.26, h: 0.2 },
    ],
    { bone: kspine, color: GLAZE_P },
  );
  b.decal(torso, TABARD, { at: [0, 1.2, 0.62], dir: [0, 0, 1], size: [0.3, 0.34], segments: 10 });
  blob(ARMOR, [0, 1.4, 0.48], [0.3, 0.075, 0.18], chestJ); // shoulder yoke
  const waist = b.surface(torso).loop([0, 1.0, 0.43], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(waist, 0.024, { color: COBALT, sides: 6 });
  const buckleHit = b.surface(torso).ray([0, 1.0, 2], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.08, 0.065, 0.024), GOLD, buckleHit, { embed: 0.3 });
    b.stick(new THREE.BoxGeometry(0.045, 0.03, 0.03), COBALT, buckleHit.moved([0, 0.012, 0]), { embed: 0.2 });
  }
  b.lathe(
    [
      [0, 0.1],
      [0.22, 0.1],
      [0.34, -0.2],
      [0.3, -0.22],
      [0.19, 0.05],
      [0, 0.05],
    ],
    { at: [0, 0.9, 0.42], axis: [0, 1, 0], segments: 14, color: SKIRT_P, bone: pelvis },
  );
  // gorget
  b.lathe(
    [
      [0, -0.02],
      [0.15, -0.02],
      [0.16, 0.03],
      [0.12, 0.09],
      [0, 0.09],
    ],
    { at: [0, 1.44, 0.49], axis: [0, 1, 0], segments: 10, color: ARMOR_D, bone: neckK },
  );
  b.part(new THREE.TorusGeometry(0.15, 0.012, 5, 14), GOLD, { at: [0, 1.5, 0.49], rotation: [90, 0, 0], bone: neckK });

  // ---------- lance (computed first so the grip hand lands on it) ----------
  const BUTT: P3 = [-0.62, 1.1, -0.05];
  const TIP: P3 = [0.7, 1.7, 4.1];
  const LD = unit3(sub3(TIP, BUTT));
  const L = (u: number): P3 => [
    BUTT[0] + (TIP[0] - BUTT[0]) * u,
    BUTT[1] + (TIP[1] - BUTT[1]) * u,
    BUTT[2] + (TIP[2] - BUTT[2]) * u,
  ];

  // ---------- arms ----------
  const arm = (s: 1 | -1, shoulderP: P3, elbowP: P3, handP: P3) => {
    const sd = s > 0 ? "L" : "R";
    const ch = b.chain(`arm${sd}`, polyline([shoulderP, elbowP, handP]), {
      parent: chestJ,
      role: "arm",
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
    });
    const sh = ch.joints[0];
    const el = ch.joints[1];
    const wr = ch.joints[ch.joints.length - 1];
    b.sweep(ch, (t) => 0.068 - 0.016 * t, { color: ARMOR, sides: 8 });
    blob(ARMOR_D, elbowP, [0.082, 0.082, 0.082], el); // couter
    b.part(ball(0.022, 6, 4), GOLD, { at: add3(elbowP, [s, 0.2, -0.1], 0.07), bone: el });
    b.part(band(GLAZE, 0.078, 0.03), GLAZE, { frame: ch.at(0.22) });
    b.part(band(GLAZE, 0.066, 0.03), GLAZE, { frame: ch.at(0.78) });
    // pauldron: two lames
    const ax: P3 = unit3([s * 0.35, 1, 0]);
    b.lathe(
      [
        [0, 0.13],
        [0.08, 0.12],
        [0.14, 0.07],
        [0.17, -0.02],
        [0.15, -0.04],
        [0, -0.04],
      ],
      { at: add3(shoulderP, [0, 1, 0], 0.01), axis: ax, segments: 8, color: ARMOR_D, bone: sh },
    );
    b.lathe(
      [
        [0, 0.04],
        [0.1, 0.03],
        [0.14, -0.03],
        [0.12, -0.05],
        [0, -0.05],
      ],
      { at: [shoulderP[0] + s * 0.06, shoulderP[1] - 0.08, shoulderP[2]], axis: ax, segments: 8, color: ARMOR, bone: sh },
    );
    b.part(ball(0.028, 6, 5), GOLD, { at: add3(shoulderP, ax, 0.14), bone: sh });
    return { ch, sh, el, wr };
  };

  const handR = L(0.19);
  const armR = arm(-1, [-0.3, 1.38, 0.45], [-0.52, 1.14, 0.55], handR);
  b.capsule(L(0.16), L(0.23), 0.062, { bone: armR.wr, color: ARMOR_D });
  b.part(ball(0.03, 6, 4), GOLD, { at: add3(L(0.2), [1, 0.4, 0], -0.062), bone: armR.wr });

  // shield (left arm)
  const TH = (50 * Math.PI) / 180;
  const FACE: P3 = [Math.sin(TH), 0, Math.cos(TH)];
  const ACROSS: P3 = [Math.cos(TH), 0, -Math.sin(TH)];
  const SC: P3 = [0.68, 1.1, 0.92];
  const handL = add3(SC, FACE, -0.12);
  const armL = arm(1, [0.3, 1.38, 0.45], [0.52, 1.12, 0.52], [handL[0], handL[1] - 0.02, handL[2]]);
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), ARMOR_D, { at: handL, rotation: [0, 50, 0], bone: armL.wr });
  const heater: Pt2[] = [
    [-0.31, 0.32, "sharp"],
    [-0.31, 0.0],
    [-0.21, -0.3],
    [0, -0.64, "sharp"],
    [0.21, -0.3],
    [0.31, 0.0],
    [0.31, 0.32, "sharp"],
  ];
  const shieldT = 0.045;
  const shield = b.extrude(heater, {
    at: SC,
    x: ACROSS,
    thickness: shieldT,
    bevel: 0.01,
    smoothing: 1,
    color: ARMOR,
    bone: armL.wr,
  });
  b.part(new THREE.PlaneGeometry(0.58, 0.92), "#ffffff", {
    at: shield.local([0, -0.16, shieldT / 2 + 0.003]),
    dir: FACE,
    axis: "z",
    up: [0, 1, 0],
    texture: SHIELD,
    bone: armL.wr,
  });
  const studUV: [number, number][] = [
    [-0.265, 0.28],
    [0, 0.285],
    [0.265, 0.28],
    [-0.27, 0.08],
    [0.27, 0.08],
    [-0.22, -0.16],
    [0.22, -0.16],
    [-0.12, -0.4],
    [0.12, -0.4],
    [0, -0.57],
  ];
  for (const [u, v] of studUV)
    b.part(ball(0.017, 6, 4), GOLD, { at: shield.local([u, v, shieldT / 2 + 0.004]), bone: armL.wr });

  // ---------- lance build ----------
  const lanceBone = armR.wr;
  b.rod(L(0), L(0.965), [0.034, 0.02], { bone: lanceBone, color: LANCE_P, sides: 8 });
  b.spike(L(0.96), L(1.0), null, 0.032, { color: GOLD, bone: lanceBone });
  b.part(ball(0.048, 8, 6), GOLD, { at: L(-0.004), bone: lanceBone });
  for (const u of [0.13, 0.24, 0.5, 0.75])
    b.part(band(GOLD, 0.04, 0.022), GOLD, { at: L(u), dir: LD, bone: lanceBone });
  b.lathe(
    [
      [0.026, 0.1],
      [0.06, 0.05],
      [0.15, -0.05],
      [0.15, -0.07],
      [0.05, -0.02],
      [0.026, 0.0],
    ],
    { at: L(0.255), axis: LD, segments: 10, color: ARMOR_D, bone: lanceBone },
  );
  b.part(new THREE.TorusGeometry(0.148, 0.011, 5, 12), GOLD, { at: add3(L(0.255), LD, -0.06), dir: LD, axis: "z", bone: lanceBone });
  // pennon
  const PX = unit3([-LD[0], -LD[1] - 0.15, -LD[2]]);
  const dotY = PX[1];
  const PY = unit3([-PX[0] * dotY, 1 - PX[1] * dotY, -PX[2] * dotY]);
  b.extrude(
    [
      [0, -0.11],
      [0, 0.11],
      [0.85, 0.2, "sharp"],
      [0.62, 0, "sharp"],
      [0.85, -0.2, "sharp"],
    ],
    { at: L(0.86), x: PX, y: PY, thickness: 0.012, color: PENNON_P, bone: lanceBone },
  );

  // ---------- legs, spread astride the wide snail ----------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip: P3 = [s * 0.15, 0.8, 0.42];
    const knee: P3 = [s * 0.52, 0.68, 0.8];
    const ankle: P3 = [s * 0.62, 0.22, 0.72];
    const leg = b.chain(`leg${sd}`, polyline([hip, knee, ankle]), {
      parent: pelvis,
      role: "leg",
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
    });
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[leg.joints.length - 1];
    b.sweep(leg, (t) => 0.09 - 0.036 * t, { color: ARMOR, sides: 8 });
    blob(ARMOR_D, knee, [0.095, 0.095, 0.095], kneeJ); // poleyn
    b.part(ball(0.026, 6, 4), GOLD, { at: [knee[0] + s * 0.07, knee[1] + 0.03, knee[2] + 0.06], bone: kneeJ });
    b.part(band(GLAZE, 0.1, 0.035), GLAZE, { frame: leg.at(0.25) });
    b.part(band(GLAZE, 0.07, 0.035), GLAZE, { frame: leg.at(0.8) });
    b.capsule([s * 0.62, 0.15, 0.66], [s * 0.62, 0.115, 0.99], [0.058, 0.04], { bone: ankleJ, color: ARMOR_D });
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.08), ARMOR_D, { at: [s * 0.62, 0.14, 0.66], bone: ankleJ });
    b.spike([s * 0.62, 0.14, 0.62], [0, -0.3, -1], 0.07, 0.014, { color: GOLD, bone: ankleJ });
    b.part(new THREE.TorusGeometry(0.075, 0.012, 6, 10), GOLD, { at: [s * 0.62, 0.17, 0.86], bone: ankleJ });
  }

  // ---------- cape (membrane between two trailing edges) ----------
  const capeEdge = (s: number) =>
    catmull([
      [s * 0.28, 1.4, 0.36],
      [s * 0.34, 1.1, 0.18],
      [s * 0.42, 0.82, 0.0],
      [s * 0.48, 0.64, -0.12],
    ]);
  b.membrane(capeEdge(1), capeEdge(-1), { color: CAPE_P, thickness: 0.02, rows: 6, bone: chestJ });

  // ---------- helm ----------
  const helm = b.lathe(
    [
      [0, 0.21],
      [0.08, 0.205],
      [0.13, 0.17],
      [0.155, 0.1],
      [0.16, -0.1],
      [0.15, -0.19],
      [0, -0.19],
    ],
    { at: [0, 1.72, 0.5], axis: [0, 1, 0], segments: 12, color: HELM_P, bone: head },
  );
  b.part(new THREE.TorusGeometry(0.152, 0.01, 5, 14), GOLD, { at: [0, 1.54, 0.5], rotation: [90, 0, 0], bone: head });
  b.part(new THREE.TorusGeometry(0.157, 0.008, 5, 14), GOLD, { at: [0, 1.76, 0.5], rotation: [90, 0, 0], bone: head });
  const visor = b.extrude(
    [
      [-0.125, -0.1],
      [0.125, -0.1],
      [0.14, 0.05],
      [0, 0.115],
      [-0.14, 0.05],
    ],
    { at: [0, 1.715, 0.655], x: [1, 0, 0], thickness: 0.026, bevel: 0.006, smoothing: 1, color: PLATE_L, bone: visorJ },
  );
  b.decal(visor, VISOR, { at: [0, 1.72, 0.672], dir: [0, 0, 1], size: [0.25, 0.14], segments: 10, bone: visorJ });
  for (const s of [1, -1]) b.part(ball(0.014, 5, 4), GOLD, { at: [s * 0.11, 1.68, 0.665], bone: visorJ });
  b.extrude(
    [
      [-0.17, 0],
      [-0.12, 0.05],
      [0, 0.078],
      [0.12, 0.05],
      [0.17, 0],
    ],
    { at: [0, 1.9, 0.5], x: [0, 0, 1], thickness: 0.035, bevel: 0.006, smoothing: 1, color: GLAZE_P, bone: head },
  );
  // plume of painted feathers
  const plumeFrames = [];
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    plumeFrames.push(frame([0, 1.93 - 0.012 * u, 0.62 - 0.28 * u], unit3([0, 1, 0.6 - 1.75 * u])));
  }
  b.cards(plumeFrames, FEATHER, {
    size: [0.17, 0.46],
    flow: [1, 0, 0],
    vary: 0.18,
    spin: 6,
    rng: rng(11),
    bone: head,
    sink: 0.15,
  });
  void helm;
  void bossPlate;

  // =====================================================================
  //  finishing: open the snail's grin, glaze everything
  // =====================================================================
  b.pose(snailJaw, { axis: [1, 0, 0], deg: 10 });

  const root = b.root;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && !Array.isArray(m.material)) {
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat && mat.roughness !== undefined) {
        mat.roughness = 0.28;
        mat.metalness = 0.02;
      }
    }
  });
  return root;
}
