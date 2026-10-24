```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A hunched gothic stone gargoyle crouched on a moulded cathedral ledge: ember eyes, swept horns, fanged jaw that opens, carved bat wings, curled spade tail, weathered limestone with moss and rain streaks.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const D = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
const fract = (x: number) => x - Math.floor(x);
const bump = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));
const hash2 = (a: number, b: number, seed: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return x - Math.floor(x);
};

const WARM = "#f0d9a8";
const COOL = "#4d5c78";
const SOOT = "#26231f";
const MOSS_LO = "#47672a";
const MOSS_HI = "#6b8c3a";

/** Weathered limestone: light on top, cool underneath, rain streaks on sides, moss on upward faces, pits. */
function stone(lo: string, hi: string, seed: number, moss = 0.35, grime = 0.45) {
  return paint((p, n) => {
    const big = noise(p, 0.24, seed);
    const fine = noise(p, 0.04, seed + 3);
    let c = mix(lo, hi, 0.1 + 0.65 * big + 0.3 * fine);
    const streak = noise(new THREE.Vector3(p.x * 4, p.y * 0.8, p.z * 4), 0.12, seed + 8);
    c = mix(c, SOOT, grime * smoothstep(0.55, 0.8, streak) * (1 - smoothstep(0.3, 0.8, Math.abs(n.y))));
    c = mix(c, WARM, 0.22 * smoothstep(0.2, 1, n.y));
    c = mix(c, COOL, 0.3 * smoothstep(0.1, -0.9, n.y));
    const m = smoothstep(0.52, 0.72, noise(p, 0.1, seed + 11)) * smoothstep(0.35, 0.85, n.y);
    c = mix(c, mix(MOSS_LO, MOSS_HI, noise(p, 0.03, seed + 2)), moss * m);
    c = mix(c, SOOT, 0.35 * smoothstep(0.78, 0.9, noise(p, 0.025, seed + 19)));
    return c;
  });
}

/** Courses of cut blocks with mortar joints and a little tone change per block, over any base paint. */
function ashlar(cw: number, ch: number, seed: number, base: ReturnType<typeof paint>) {
  return paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const top = ay >= ax && ay >= az;
    let u: number;
    let v: number;
    if (top) {
      u = p.x;
      v = p.z;
    } else if (ax >= az) {
      u = p.z;
      v = p.y;
    } else {
      u = p.x;
      v = p.y;
    }
    const cellH = top ? ch * 3 : ch;
    const row = Math.floor(v / cellH);
    const uu = u + (row & 1 ? cw * 0.5 : 0);
    const col = Math.floor(uu / cw);
    const du = (uu / cw - col) * cw;
    const dv = (v / cellH - row) * cellH;
    const edge = Math.min(du, cw - du, dv, cellH - dv);
    const c = base.at(p, n);
    const tone = hash2(row, col, seed);
    const out = mix(c, tone > 0.5 ? "#d6cdb8" : "#7d7668", 0.1 + 0.3 * Math.abs(tone - 0.5));
    if (edge < 0.004) return mix(out, SOOT, 0.8);
    if (edge < 0.009) return mix(out, n.y > 0.5 ? WARM : COOL, 0.2);
    return out;
  });
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "gargoyle" });
  type J = ReturnType<typeof b.joint>;
  const LEDGE = 0.28; // top of the ledge

  // ---- paints ---------------------------------------------------------------------------------------------
  const BODY = stone("#6a6762", "#a39d92", 1);
  const BODY2 = stone("#585550", "#8f897f", 2, 0.2);
  const HEADS = stone("#716d67", "#aaa498", 6, 0.3);
  const HORN = stone("#3b383a", "#6d6760", 3, 0, 0.2);
  const TOOTH = stone("#b5ad9a", "#e4dcc6", 4, 0, 0.2);
  const CLAW = stone("#26242a", "#4f4a4c", 5, 0, 0.1);
  const LEDGE_BASE = stone("#8c8577", "#b9b09c", 9, 0.5, 0.6);
  const LEDGE_ST = ashlar(0.3, 0.09, 13, LEDGE_BASE);
  const WING = paint((p, n, s) => {
    let c = mix("#5f626b", "#a7a398", 0.15 + 0.55 * noise(p, 0.18, 21) + 0.25 * s[0]);
    const f = Math.abs(fract(s[1] * 4) - 0.5);
    const edge = Math.abs(s[1] - 0.5);
    if (f > 0.465 || edge > 0.47) c = mix(c, SOOT, 0.7);
    c = mix(c, WARM, 0.2 * smoothstep(0.2, 1, n.y));
    c = mix(c, COOL, 0.3 * smoothstep(0.1, -0.9, n.y));
    c = mix(c, SOOT, 0.3 * smoothstep(0.62, 0.85, noise(p, 0.05, 27)));
    return c;
  });

  // ---- textures -------------------------------------------------------------------------------------------
  const EYE = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="50%" cy="50%" r="60%">
        <stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#ffb02e"/><stop offset="1" stop-color="#d9531a"/>
      </radialGradient></defs>
      <path d="M1 24 Q32 -4 63 24 Q32 46 1 24Z" fill="#17100f"/>
      <path d="M7 24 Q32 6 57 24 Q32 38 7 24Z" fill="url(#g)"/>
      <path d="M7 24 Q32 6 57 24 Q32 13 7 24Z" fill="#2a1410" opacity=".6"/>
      <ellipse cx="32" cy="25" rx="3.6" ry="8" fill="#2a0e06"/>
      <circle cx="25" cy="21" r="2.6" fill="#fffbe0"/>
    </svg>`,
    { size: 256 },
  );

  const FRIEZE = (() => {
    let g = "";
    for (let i = 0; i < 8; i++) {
      const cx = 10 + 20 * i;
      g += `<g fill="#4c4640" stroke="#2a2522" stroke-width="1.1">
        <circle cx="${cx - 3}" cy="8" r="3.3"/><circle cx="${cx + 3}" cy="8" r="3.3"/>
        <circle cx="${cx}" cy="5" r="3.3"/><circle cx="${cx}" cy="11" r="3.3"/></g>
        <circle cx="${cx}" cy="8" r="1.5" fill="#d6cfbd" stroke="#2a2522" stroke-width=".6"/>
        <path d="M${cx - 5.5} 6.2 Q${cx - 4} 4.4 ${cx - 2.4} 4" stroke="#cfc8b6" stroke-width=".6" fill="none"/>
        <path d="M${20 * i} 1 V15" stroke="#2a2522" stroke-width=".8"/>`;
    }
    return svg(
      `<svg viewBox="0 0 160 16" xmlns="http://www.w3.org/2000/svg">
        ${g}<path d="M0 .8H160M0 15.2H160" stroke="#2a2522" stroke-width="1.4"/>
        <path d="M0 2H160" stroke="#d6cfbd" stroke-width=".5"/></svg>`,
      { size: 1280 },
    );
  })();

  const ROUNDEL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#8f897c" stroke="#2c2826" stroke-width="3"/>
      <circle cx="32" cy="32" r="24" fill="#a8a190" stroke="#3a3430" stroke-width="1.5"/>
      <g fill="#6f685c" stroke="#2c2826" stroke-width="1.6">
        <circle cx="32" cy="19" r="8"/><circle cx="32" cy="45" r="8"/><circle cx="19" cy="32" r="8"/><circle cx="45" cy="32" r="8"/>
      </g>
      <path d="M30 14h4v14h14v4H34v14h-4V32H16v-4h14z" fill="#d2c9b0" stroke="#2c2826" stroke-width="1.2"/>
      <circle cx="32" cy="32" r="3" fill="#8a2f22" stroke="#2c2826" stroke-width="1"/>
    </svg>`,
    { size: 192 },
  );

  const CRACK = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 2 L28 14 L35 22 L26 34 L33 44 L29 62" stroke="#1e1b19" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M35 22 L46 26 L52 36 M26 34 L14 38 L8 48 M33 44 L42 52" stroke="#1e1b19" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );

  const MOSS = svg(
    `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 40 Q5 20 1 6 Q10 18 11 40Z" fill="#355a24"/>
      <path d="M9 40 Q10 14 14 0 Q20 16 19 40Z" fill="#5d8a32"/>
      <path d="M17 40 Q22 22 28 8 Q28 24 25 40Z" fill="#4d7a2e"/>
      <path d="M23 40 Q27 28 31 20 Q31 32 30 40Z" fill="#7aa648"/>
    </svg>`,
    { size: 128 },
  );

  // ---- skeleton -------------------------------------------------------------------------------------------
  const HIPS = V(0, 0.58, -0.28);
  const NB = V(0, 0.75, 0.22);
  const HEADP = V(0, 0.9, 0.38);
  const HC = V(0, 0.955, 0.5);
  const H = (x: number, y: number, z: number) => HC.clone().add(V(x, y, z));

  const root = b.joint("root", { at: [0, LEDGE, 0] });
  const hips = b.joint("hips", { parent: root, at: HIPS, dir: [0, 0.1, 1] });
  const spine = b.chain("spine", catmull([HIPS, V(0, 0.64, -0.1), V(0, 0.7, 0.06), NB]), {
    parent: hips,
    role: "spine",
  });
  const neck = b.chain("neck", catmull([NB, V(0, 0.83, 0.3), HEADP]), { parent: spine.joints[2], role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: HEADP, dir: [0, -0.04, 1], role: "head" });
  const JP = H(0, -0.085, -0.06);
  const jaw = b.joint("jaw", { parent: head, at: JP, dir: [0, -0.03, 1], role: "jaw" });

  const tailPts = [
    V(0, 0.56, -0.32),
    V(0, 0.5, -0.47),
    V(0, 0.4, -0.6),
    V(0.12, 0.32, -0.66),
    V(0.34, 0.3, -0.6),
    V(0.5, 0.3, -0.42),
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 7, role: "tail" });

  // ---- ledge ----------------------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(1.6, 0.18, 1.3), LEDGE_ST, { bone: root, at: [0, 0.09, -0.08] });
  b.part(new THREE.BoxGeometry(1.68, 0.04, 1.38), LEDGE_ST, { bone: root, at: [0, 0.2, -0.08] });
  const ledgeTop = b.part(new THREE.BoxGeometry(1.76, 0.06, 1.46), LEDGE_ST, { bone: root, at: [0, 0.25, -0.08] });
  for (let i = 0; i < 6; i++) {
    const x = -0.675 + i * 0.27;
    b.part(new THREE.BoxGeometry(0.12, 0.04, 0.05), LEDGE_ST, { bone: root, at: [x, 0.2, 0.635] });
    b.part(new THREE.BoxGeometry(0.08, 0.025, 0.03), LEDGE_ST, { bone: root, at: [x, 0.17, 0.62] });
  }
  b.part(new THREE.PlaneGeometry(1.5, 0.15), "#ffffff", {
    bone: root, at: [0, 0.09, 0.574], dir: [0, 0, 1], axis: "z", texture: FRIEZE,
  });
  b.part(new THREE.PlaneGeometry(1.5, 0.15), "#ffffff", {
    bone: root, at: [0, 0.09, -0.734], dir: [0, 0, -1], axis: "z", texture: FRIEZE,
  });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.3, 0.13), "#ffffff", {
      bone: root, at: [s * 0.804, 0.09, -0.08], dir: [s, 0, 0], axis: "z", texture: FRIEZE,
    });
  // fallen chips on the ledge
  for (const [x, z, k] of [[0.72, 0.5, 0.045], [-0.74, -0.52, 0.05], [0.12, 0.6, 0.03], [-0.6, 0.4, 0.035]] as const)
    b.part(new THREE.DodecahedronGeometry(k, 0), LEDGE_BASE, { bone: root, at: [x, LEDGE + k * 0.6, z], flat: true, rotation: [20, x * 90, 10] });

  // ---- body -----------------------------------------------------------------------------------------------
  const bodyTube = b.sweep(
    spine,
    (t) => [
      0.2 + 0.06 * bump(t, 0.8, 0.35) - 0.04 * t - 0.07 * smoothstep(0.85, 1, t),
      0.185 + 0.05 * bump(t, 0.75, 0.35) - 0.035 * t - 0.04 * smoothstep(0.85, 1, t),
    ],
    { color: BODY, sides: 10, smooth: false },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
    bone: spine.joints[2], at: V(0, 0.8, 0.08), scale: [0.26, 0.17, 0.2], flat: true,
  });
  const neckTube = b.sweep(neck, [0.14, 0.12, 0.11], { color: BODY, sides: 8, smooth: false });

  // carved ribs round the flanks
  const skin = b.surface(bodyTube);
  for (const t of [0.25, 0.4, 0.55, 0.7]) {
    const c = spine.at(t);
    const lp = skin.loop(frame(c.at, [0, 0, 1]), { lift: 0.008 });
    b.sweep(lp.slice(0.08, 0.4), 0.011, { color: BODY2, sides: 5 });
    b.sweep(lp.slice(0.6, 0.92), 0.011, { color: BODY2, sides: 5 });
  }

  // dorsal spikes and mane blades
  b.along(bodyTube, 5, (at) => b.spike(at, at, 0.07 + 0.05 * bump(at.t, 0.5, 0.4), 0.028, { color: HORN, sides: 5 }), {
    from: 0.1,
    to: 0.8,
  });
  const blade = (k: number) =>
    [[0, 0], [0.14 * k, -0.01 * k], [0.22 * k, 0.06 * k, "sharp"], [0.1 * k, 0.05 * k], [0.05 * k, 0.11 * k, "sharp"], [0, 0.06 * k]] as Array<
      [number, number] | [number, number, "sharp"]
    >;
  const BX = D(0, 0.34, -0.94);
  const BY = D(0, 0.94, 0.34);
  b.along(
    neckTube,
    4,
    (at) => b.extrude(blade(0.9 + 0.5 * (1 - at.t)), { at: at.at, x: BX, y: BY, thickness: 0.026, bevel: 0.004, color: HORN }),
    { from: 0.1, to: 0.85 },
  );

  // chest roundel and cracks
  b.decal(bodyTube, ROUNDEL, { at: V(0, 0.66, 0.36), dir: [0, -0.4, 1], size: [0.14, 0.14], segments: 8 });
  b.decal(bodyTube, CRACK, { at: V(0.2, 0.7, -0.12), dir: [1, 0.2, 0], size: [0.2, 0.2] });

  // ---- tail -----------------------------------------------------------------------------------------------
  const tailTube = b.sweep(tail, (t) => 0.085 * (1 - t) + 0.022, { color: BODY, sides: 8, smooth: false });
  b.along(tailTube, 5, (at) => b.spike(at, at, 0.05 * (1 - at.t) + 0.025, 0.017, { color: HORN, sides: 5 }), {
    from: 0.12,
    to: 0.75,
  });
  {
    const e = tailPts[5];
    const d = e.clone().sub(tailPts[4]).setY(0).normalize();
    const perp = V(-d.z, 0, d.x);
    b.extrude(
      [[0, 0], [0.05, 0.05], [0.13, 0.075], [0.21, 0, "sharp"], [0.13, -0.075], [0.05, -0.05]],
      {
        at: e.clone().addScaledVector(d, -0.03), x: d, y: perp, thickness: 0.032, bevel: 0.006,
        color: HORN, bone: tail.joints[tail.joints.length - 1],
      },
    );
  }

  // ---- digit helper ---------------------------------------------------------------------------------------
  const digit = (name: string, parent: J, pts: THREE.Vector3[], r: number, clawDir: THREE.Vector3, clawLen: number) => {
    const names = pts.slice(1).map((_, i) => `${name}${String.fromCharCode(65 + i)}`);
    const ch = b.chain(name, pts.length > 2 ? catmull(pts) : polyline(pts), { parent, names, role: "digit" });
    b.sweep(ch, [r, r * 0.72], { color: BODY, sides: 6, smooth: false });
    const last = ch.joints[ch.joints.length - 1];
    b.spike(pts[pts.length - 1], clawDir, clawLen, r * 0.85, { color: CLAW, sides: 5, bone: last });
    return ch;
  };

  // ---- limbs and wings ------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";

    // leg
    const hipP = V(s * 0.22, 0.52, -0.3);
    const ankP = V(s * 0.24, 0.35, -0.12);
    const lpts = limb(hipP, ankP, [0.27, 0.27], [[s * 0.6, 0.5, 1]]);
    const leg = b.chain(`leg${N}`, lpts, {
      parent: hips, names: [`hip${N}`, `knee${N}`, `ankle${N}`], role: "leg", contact: [s * 0.24, LEDGE, 0],
    });
    b.sweep(leg, [0.11, 0.078, 0.06, 0.05], { color: BODY, sides: 8, smooth: false });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, { bone: leg.joints[0], at: hipP, scale: [0.13, 0.15, 0.17], flat: true });
    const knee = leg.joints[1].at;
    b.spike(knee, D(s, 0.35, 0.1), 0.1, 0.034, { color: HORN, sides: 5, bone: leg.joints[1] });
    b.part(new THREE.BoxGeometry(0.09, 0.06, 0.15), BODY, { bone: leg.tip!, at: V(s * 0.24, 0.31, -0.12) });
    for (const k of [-1, 0, 1])
      digit(
        `toe${N}${k + 2}`, leg.tip!,
        [V(s * 0.24 + k * 0.05, 0.318, -0.05), V(s * 0.24 + k * 0.06, 0.305, 0.06), V(s * 0.24 + k * 0.075, 0.299, 0.14)],
        0.026, D(k * 0.1, -0.35, 1), 0.055,
      );
    digit(`toe${N}Back`, leg.tip!, [V(s * 0.24, 0.315, -0.18), V(s * 0.24, 0.296, -0.27)], 0.022, D(0, -0.2, -1), 0.045);

    // arm
    const shP = V(s * 0.24, 0.68, 0.12);
    const wrP = V(s * 0.26, 0.335, 0.4);
    const apts = limb(shP, wrP, [0.27, 0.27], [[s * 0.8, 0.3, -0.5]]);
    const arm = b.chain(`arm${N}`, apts, {
      parent: spine.joints[2], names: [`shoulder${N}`, `elbow${N}`, `wrist${N}`], role: "arm", contact: [s * 0.26, LEDGE, 0.5],
    });
    b.sweep(arm, [0.1, 0.08, 0.065, 0.055], { color: BODY, sides: 8, smooth: false });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, { bone: arm.joints[0], at: shP, scale: [0.15, 0.14, 0.15], flat: true });
    b.spike(arm.joints[1].at, D(s * 0.6, 0.2, -0.8), 0.12, 0.034, { color: HORN, sides: 5, bone: arm.joints[1] });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, { bone: arm.tip!, at: V(s * 0.26, 0.335, 0.43), scale: [0.07, 0.045, 0.08], flat: true });
    for (const k of [-1, 0, 1])
      digit(
        `finger${N}${k + 2}`, arm.tip!,
        [V(s * 0.26 + k * 0.05, 0.325, 0.46), V(s * 0.26 + k * 0.058, 0.309, 0.53), V(s * 0.26 + k * 0.066, 0.302, 0.6)],
        0.024, D(k * 0.1, -0.55, 1), 0.06,
      );
    digit(`thumb${N}`, arm.tip!, [V(s * 0.2, 0.325, 0.42), V(s * 0.17, 0.31, 0.48)], 0.022, D(-s * 0.3, -0.3, 1), 0.045);

    // wing
    const SH = V(s * 0.16, 0.82, -0.02);
    const EL = V(s * 0.52, 1.06, -0.2);
    const WR = V(s * 0.9, 1.24, -0.16);
    const wingArm = b.chain(`wing${N}`, polyline([SH, EL, WR]), {
      parent: spine.joints[2], names: [`wingRoot${N}`, `wingElbow${N}`, `wingWrist${N}`], role: "wing",
    });
    const armTube = b.sweep(wingArm, [0.058, 0.042, 0.03], { color: BODY2, sides: 6, smooth: false });
    b.along(armTube, 3, (at) => b.spike(at, at, 0.055, 0.02, { color: HORN, sides: 5 }), { from: 0.2, to: 0.8 });
    b.spike(WR, D(s * 0.3, 1, 0.5), 0.1, 0.022, { color: CLAW, sides: 5, bone: wingArm.tip! });

    const tips = [V(s * 1.3, 1.36, -0.4), V(s * 1.22, 1.0, -0.6), V(s * 0.98, 0.74, -0.62), V(s * 0.62, 0.58, -0.55)];
    const fingers = tips.map((T, j) => {
      const m = WR.clone().lerp(T, 0.5).add(V(0, 0.05, -0.05));
      const f = b.chain(`wingF${j + 1}${N}`, catmull([WR, m, T]), {
        parent: wingArm.tip!, names: [`wingF${j + 1}${N}a`, `wingF${j + 1}${N}b`], role: "digit",
      });
      b.sweep(f, [0.024, 0.009], { color: BODY2, sides: 5, smooth: false });
      b.spike(T, T.clone().sub(m).normalize(), 0.07, 0.014, { color: CLAW, sides: 5, bone: f.joints[1] });
      return f;
    });
    for (let j = 0; j < 3; j++)
      b.membrane(fingers[j], fingers[j + 1], { color: WING, thickness: 0.018, scallop: 0.1 });
    const bodyEdge = [WR, V(s * 0.5, 0.85, -0.3), V(s * 0.2, 0.6, -0.32)];
    b.membrane(fingers[3], bodyEdge, { color: WING, thickness: 0.018, scallop: 0.1, bone: spine.joints[1] });
    b.membrane([WR, EL, SH], bodyEdge, { color: WING, thickness: 0.018, bone: spine.joints[2] });
  }

  // ---- head -----------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 9, 7), HEADS, {
    bone: head, at: HC, scale: [0.175, 0.15, 0.17], flat: true,
  });
  b.frustumBox(H(0, -0.035, 0.08), H(0, -0.05, 0.3), [0.25, 0.13], [0.21, 0.1], { bone: head, color: HEADS });
  b.frustumBox(H(0, 0.03, 0.1), H(0, 0.02, 0.3), [0.07, 0.04], [0.1, 0.035], { bone: head, color: HEADS });
  b.part(new THREE.BoxGeometry(0.14, 0.055, 0.05), HEADS, { bone: head, at: H(0, 0.0, 0.3) });
  b.spike(H(0, 0.04, 0.2), D(0, 1, 0.5), 0.05, 0.022, { color: HORN, sides: 5, bone: head });
  // mouth cavity and tongue
  b.part(new THREE.BoxGeometry(0.17, 0.05, 0.28), "#1b1210", { bone: head, at: H(0, -0.085, 0.17) });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.02, 0.025), "#120c0b", { bone: head, at: H(s * 0.04, 0.0, 0.327) });
    // brows
    b.part(new THREE.BoxGeometry(0.17, 0.05, 0.12), HORN, {
      bone: head, at: H(s * 0.085, 0.075, 0.1), rotation: [-8, 0, s * 18],
    });
    // cheekbones
    b.part(new THREE.SphereGeometry(1, 6, 5), HEADS, {
      bone: head, at: H(s * 0.125, -0.025, 0.05), scale: [0.05, 0.04, 0.065], flat: true,
    });
    // ears
    b.extrude([[-0.05, 0], [0.05, 0], [0.04, 0.09], [0.0, 0.21, "sharp"], [-0.04, 0.1]], {
      at: H(s * 0.14, 0.06, -0.06), x: [s, 0, 0], y: [s * 0.45, 1, 0], thickness: [0.032, 0.012], bevel: 0.004, color: HEADS, bone: head,
    });
    // swept cheek fins
    b.extrude([[0, 0], [0.1, 0.03], [0.07, 0.06], [0.14, 0.1, "sharp"], [0.08, 0.12], [0.11, 0.18, "sharp"], [0.02, 0.14]], {
      at: H(s * 0.15, -0.07, -0.01), x: [s * 0.6, 0, -0.8], y: [0, 1, 0], thickness: 0.022, bevel: 0.004, color: HORN, bone: head,
    });
    // horns
    const hit = b.surface(skull).around(HC).at(s * 40, 55)!;
    const B = hit.at.clone();
    const horn = b.sprout(`horn${s > 0 ? "L" : "R"}`, hit,
      catmull([B, B.clone().add(V(s * 0.07, 0.05, -0.02)), B.clone().add(V(s * 0.15, 0.09, -0.1)), B.clone().add(V(s * 0.19, 0.17, -0.2))]),
      [0.042, 0.006], { count: 0, color: HORN, sides: 6, caps: { end: "point" } });
    b.along(horn.sweep, 3, (at) =>
      b.part(new THREE.TorusGeometry(at.radius * 1.05, 0.008, 4, 6), HORN, { at, dir: at.tangent, axis: "z", bone: head }),
      { from: 0.15, to: 0.6 },
    );
    // eyes
    const eh = b.surface(skull).around(HC).at(s * 28, 8)!;
    glow(
      b.decal(skull, EYE, { at: eh.at, dir: [s * 0.35, 0, 1], up: [0, 1, 0], size: [0.095, 0.06], roll: s * 16, segments: 8 }),
      1.3,
    );
    // upper fangs and teeth
    b.spike(H(s * 0.09, -0.098, 0.27), D(s * 0.1, -1, 0.15), 0.085, 0.02, { color: TOOTH, sides: 5, bone: head });
    for (let i = 0; i < 4; i++)
      b.spike(H(s * (0.108 - i * 0.004), -0.098, 0.08 + i * 0.045), D(0, -1, 0.1), 0.03, 0.01, { color: TOOTH, sides: 4, bone: head });
    // lower tusks and teeth
    b.spike(JP.clone().add(V(s * 0.05, 0.02, 0.33)), D(s * 0.05, 1, 0.12), 0.09, 0.02, { color: TOOTH, sides: 5, bone: jaw });
    for (let i = 0; i < 4; i++)
      b.spike(JP.clone().add(V(s * (0.095 - i * 0.004), 0.02, 0.1 + i * 0.05)), D(0, 1, 0), 0.03, 0.01, { color: TOOTH, sides: 4, bone: jaw });
  }
  // lower jaw
  b.frustumBox(JP.clone().add(V(0, 0, 0.02)), JP.clone().add(V(0, -0.01, 0.36)), [0.24, 0.065], [0.17, 0.055], { bone: jaw, color: HEADS });
  b.part(new THREE.BoxGeometry(0.15, 0.04, 0.06), HEADS, { bone: jaw, at: JP.clone().add(V(0, -0.04, 0.33)) });
  b.part(new THREE.BoxGeometry(0.09, 0.015, 0.22), "#6e3d36", { bone: jaw, at: JP.clone().add(V(0, 0.03, 0.17)) });
  for (const x of [-0.04, 0, 0.04])
    b.spike(JP.clone().add(V(x, -0.05, 0.34)), D(0, -1, 0.5), 0.07 + (x === 0 ? 0.03 : 0), 0.016, { color: HORN, sides: 4, bone: jaw });
  // brow crest
  b.along(polyline([H(0, 0.14, 0.09), H(0, 0.15, -0.02), H(0, 0.1, -0.13)]), 3, (at) =>
    b.spike(at, D(0, 1, -0.3), 0.07, 0.028, { color: HORN, sides: 5, bone: head }),
  );

  // ---- moss -----------------------------------------------------------------------------------------------
  const ledgeHits = b.surface(ledgeTop).scatter(34, {
    rng: rng(21), minDist: 0.1,
    filter: (h) => h.n.y > 0.8 && (Math.abs(h.at.x) > 0.5 || h.at.z > 0.5 || h.at.z < -0.62),
  });
  b.cards(ledgeHits, MOSS, { size: [0.05, 0.06], lean: 20, cross: true, vary: 0.4, rng: rng(5), bone: root });
  const bodyHits = b.surface(bodyTube).scatter(14, { rng: rng(33), minDist: 0.08, filter: (h) => h.n.y > 0.6 });
  b.cards(bodyHits, MOSS, { size: [0.035, 0.045], lean: 20, cross: true, vary: 0.4, rng: rng(6) });
  const skullHits = b.surface(skull).scatter(6, { rng: rng(41), minDist: 0.05, filter: (h) => h.n.y > 0.7 });
  b.cards(skullHits, MOSS, { size: [0.03, 0.04], lean: 20, cross: true, vary: 0.3, rng: rng(7) });

  // ---- rest pose: jaw ajar --------------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });

  return b.root;
}
```