import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { mix, noise, paint, smoothstep, spots } from "../src/paint";
import type { Fill } from "../src/context";
import type { Part } from "../src/parts";
import type { Chain, Joint } from "../src/skeleton";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Sea Otter with Clam",
  description:
    "A chubby, grinning sea otter sits up on a mossy tide rock hugging a lavender clam with a pearl peeking out, kelp belt round its tummy, a crab and starfish for company.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---- palette -------------------------------------------------------------------------------------------------
const FUR = "#7a4f33";
const FUR_D = "#4f301f";
const FUR_L = "#a26f47";
const BELLY = "#c49467";
const CREAM = "#f4e2bd";
const CREAM_D = "#dcc193";
const BLUSH = "#f39a8a";
const NOSE = "#2b1b1d";
const SKIN = "#3d2a2a";
const SKIN_L = "#5b4040";
const EYE = "#1a1114";
const WHITE = "#fffaf0";
const PINK = "#f2a1a6";
const SHELL = "#c9a8e0";
const SHELL_D = "#8f6bb8";
const SHELL_L = "#eadcf5";
const MEAT = "#f59a82";
const ROCK_D = "#59606e";
const ROCK_L = "#8d97a6";
const ROCK_WET = "#3f4a5c";
const MOSS = "#7fa35a";
const KELP = "#7e9a3a";
const KELP_D = "#55702a";
const BARN = "#e9e4d6";
const CRAB = "#ee5e3f";
const STAR = "#ff9a3d";
const STAR_D = "#e5602b";
const WATER = "#a5dff0";

// ---- helpers -------------------------------------------------------------------------------------------------
const keyed = (keys: number[]) => (u: number) => {
  const f = Math.min(Math.max(u, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
};

const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(Math.round(x * 1000) * 12.9898 + Math.round(y * 1000) * 78.233 + Math.round(z * 1000) * 37.719) * 43758.5453;
  return s - Math.floor(s);
};

/** A lumpy low-poly boulder: jittered icosphere with an optional flat top and base. */
function boulder(c: [number, number, number], r: [number, number, number], jit: number, detail: number, top = 9, base = -9) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 1 + (hash3(x, y, z) - 0.5) * 2 * jit;
    const Y = Math.min(Math.max(c[1] + y * k * r[1], base), top);
    pos.setXYZ(i, c[0] + x * k * r[0], Y, c[2] + z * k * r[2]);
  }
  g.computeVertexNormals();
  return g;
}

const clamOutline = (sc: number): [number, number][] => {
  const right: [number, number][] = [
    [0.012, 0],
    [0.05, 0.02],
    [0.085, 0.06],
    [0.098, 0.105],
    [0.09, 0.15],
    [0.055, 0.182],
    [0, 0.19],
  ];
  const left: [number, number][] = right
    .slice(1, -1)
    .reverse()
    .map(([x, y]) => [-x, y]);
  return [...right, ...left, [-0.012, 0]].map(([x, y]) => [x * sc, y * sc]);
};

export default function build() {
  const b = createBuilder({ name: "seaOtter" });
  const sph = (sw = 10, sh = 7) => new THREE.SphereGeometry(1, sw, sh);
  const blob = (
    rx: number,
    ry: number,
    rz: number,
    color: Fill,
    at: [number, number, number],
    bone: Joint,
    opts: { dir?: [number, number, number]; sw?: number; sh?: number; name?: string } = {},
  ) => b.part(sph(opts.sw ?? 10, opts.sh ?? 7), color, { bone, at, scale: [rx, ry, rz], dir: opts.dir, name: opts.name });

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0.17, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.3, -0.1],
      [0, 0.44, -0.075],
      [0, 0.57, -0.04],
      [0, 0.68, -0.005],
    ]),
    { parent: root, names: ["pelvis", "spine", "chest", "neck"], role: "spine" },
  );
  const [pelvis, , chest, neck] = spine.joints;
  const head = b.joint("head", { parent: neck, at: [0, 0.7, 0.0], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.705, 0.11], aim: [0, 0.69, 0.2], role: "jaw" });

  // ---- paints and textures ----------------------------------------------------------------------------------
  const coat = paint((p, n) => {
    const f = noise(p, 0.05, 3);
    const streak = noise(new THREE.Vector3(p.x * 2, p.y * 0.6, p.z * 2), 0.04, 9);
    let c = mix(FUR_D, FUR, smoothstep(0.3, 0.7, f));
    c = mix(c, FUR_L, smoothstep(0.55, 0.85, streak) * 0.55);
    const bib = smoothstep(0.1, 0.7, n.z) * smoothstep(0.3, 0.6, p.y);
    c = mix(c, BELLY, bib * 0.75);
    if (noise(p, 0.017, 5) > 0.7) c = mix(c, CREAM_D, 0.35);
    return c;
  });
  const headPaint = paint((p) => {
    const face = smoothstep(0.03, 0.15, p.z);
    let c = mix(FUR_L, CREAM, face);
    const cap = smoothstep(0.82, 0.9, p.y) * (1 - smoothstep(0.1, 0.2, p.z));
    c = mix(c, FUR, cap * 0.85);
    if (noise(p, 0.015, 8) > 0.7) c = mix(c, CREAM_D, 0.4);
    return c;
  });
  const limbPaint = paint((p) => mix(FUR_D, FUR, smoothstep(0.3, 0.7, noise(p, 0.05, 6))));
  const skinPaint = paint((p) => mix(SKIN, SKIN_L, smoothstep(0.4, 0.8, noise(p, 0.02, 2))));
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48"><path d="M3 48 Q5 24 14 3 Q16 26 18 48Z" fill="#ffffff"/><path d="M12 48 Q16 22 29 9 Q26 30 25 48Z" fill="#e2e2e2"/><path d="M9 48 Q12 28 17 13 Q22 28 21 48Z" fill="#c4c4c4"/></svg>`,
    { size: 96 },
  );
  const kelpTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 72"><path d="M10 72 C6 52 18 46 12 28 C8 16 14 8 16 0 C20 10 22 22 18 34 C14 48 20 60 14 72Z" fill="${KELP}"/><path d="M12 70 C9 52 17 44 14 28 C12 18 15 10 16 3" fill="none" stroke="#b4cf68" stroke-width="1.8"/></svg>`,
    { size: 192 },
  );

  // ---- rock ------------------------------------------------------------------------------------------------
  const rockPaint = paint((p, n) => {
    let c = mix(ROCK_D, ROCK_L, smoothstep(0.3, 0.7, noise(p, 0.14, 2)));
    c = mix(c, ROCK_WET, (1 - smoothstep(0.0, 0.1, p.y)) * 0.7);
    const crack = noise(p, 0.07, 4);
    if (Math.abs(crack - 0.5) < 0.018) c = mix(c, ROCK_WET, 0.7);
    const moss = smoothstep(0.55, 0.85, n.y) * smoothstep(0.5, 0.66, noise(p, 0.1, 7));
    return mix(c, MOSS, moss * 0.75);
  });
  const rock = b.part(boulder([0, -0.05, -0.1], [0.44, 0.32, 0.5], 0.1, 2, 0.17, 0), rockPaint, {
    bone: root,
    at: [0, 0, 0],
    flat: true,
    name: "rock",
  });
  const rockSkin = b.surface(rock);
  const extraRocks: [[number, number, number], [number, number, number], number][] = [
    [[0.4, 0.05, 0.22], [0.14, 0.08, 0.12], 0.12],
    [[-0.42, 0.045, 0.15], [0.13, 0.08, 0.15], 0.14],
    [[0.3, 0.04, -0.46], [0.15, 0.07, 0.12], 0.12],
    [[0.06, 0.035, 0.46], [0.12, 0.06, 0.09], 0.12],
  ];
  extraRocks.forEach(([c, r, j], i) => {
    b.part(boulder(c, r, j, 1, 9, 0), rockPaint, { bone: root, at: [0, 0, 0], flat: true, name: `boulder${i}` });
  });
  // barnacles + moss tufts
  for (const h of rockSkin.scatter(30, { rng: rng(21), minDist: 0.07, filter: (h) => Math.abs(h.n.y) < 0.5 && h.at.y < 0.15 && h.at.y > 0.02 })) {
    b.stick(new THREE.ConeGeometry(0.013, 0.02, 6), BARN, h, { embed: 0.3 });
  }
  // mussel clusters
  for (const h of rockSkin.scatter(22, { rng: rng(23), minDist: 0.05, filter: (h) => Math.abs(h.n.y) < 0.6 && h.at.y < 0.12 && h.at.y > 0.01 })) {
    b.stick(sph(6, 4), "#27345a", h, { scale: [0.011, 0.009, 0.022], embed: 0.3, spin: h.at.x * 900, name: "mussel" });
  }
  // seaweed hanging over the rim
  const rimHits = rockSkin.scatter(22, { rng: rng(8), minDist: 0.16, filter: (h) => h.at.y > 0.12 && h.n.y < 0.75 && h.n.y > 0.05 });
  b.cards(
    rimHits.map((h) => frame(h.moved([0, 0.01, 0]), [0, 1, 0])),
    kelpTex,
    {
      size: [0.06, 0.12],
      lean: 180,
      flow: (f) => [f.at.x, 0, f.at.z + 0.12],
      vary: 0.3,
      rng: rng(9),
      bend: 15,
    },
  );
  // tide puddle
  b.part(new THREE.CylinderGeometry(1, 1, 0.005, 12), WATER, { bone: root, at: [-0.26, 0.1725, 0.2], scale: [0.09, 1, 0.06], name: "puddle" });
  b.part(new THREE.CylinderGeometry(1, 1, 0.003, 12), "#d6f3fa", { bone: root, at: [-0.255, 0.1745, 0.198], scale: [0.05, 1, 0.03], name: "puddleShine" });

  // ---- body -------------------------------------------------------------------------------------------------
  const RX = keyed([0.13, 0.19, 0.215, 0.19, 0.12]);
  const RY = keyed([0.13, 0.17, 0.2, 0.17, 0.11]);
  const body = b.sweep(spine, (t) => [RX(t), RY(t)], { color: coat, name: "body" });
  const bodySkin = b.surface(body);

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.26, -0.21],
      [0, 0.205, -0.36],
      [0.07, 0.2, -0.45],
      [0.17, 0.225, -0.46],
      [0.25, 0.29, -0.42],
    ]),
    { parent: pelvis, count: 5, role: "tail" },
  );
  const TRX = keyed([0.09, 0.085, 0.07, 0.05, 0.03]);
  const TRY = keyed([0.045, 0.04, 0.032, 0.026, 0.02]);
  const tailTube = b.sweep(tail, (t) => [TRX(t), TRY(t)], { color: limbPaint, name: "tail" });
  b.cards(
    b.surface(tailTube).scatter(30, { rng: rng(31), minDist: 0.04, filter: (h) => h.n.y > 0.0 }),
    tuft,
    { size: [0.035, 0.05], lean: 65, bend: 20, flow: [0, 0, -1], vary: 0.3, rng: rng(32), color: limbPaint },
  );

  // legs and feet
  const feet: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.115, 0.34, -0.07];
    const ankle: [number, number, number] = [s * 0.15, 0.215, -0.03];
    const ball: [number, number, number] = [s * 0.185, 0.19, 0.115];
    const pts = limb(hip, ankle, [0.16, 0.14], [s * 0.3, 0, 1]);
    const leg = b.chain(`leg${side}`, [...pts, ball], {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [ball[0], 0.17, ball[2]],
    });
    feet[side] = leg;
    const tAnkle = leg.ts[2];
    const thigh = keyed([0.09, 0.083, 0.05]);
    const legTube = b.sweep(leg, (t) => thigh(t / tAnkle), { to: tAnkle, color: limbPaint, name: `leg${side}` });
    const fx = keyed([0.048, 0.062, 0.072]);
    const fy = keyed([0.036, 0.026, 0.017]);
    b.sweep(leg, (t) => {
      const u = (t - tAnkle) / (1 - tAnkle);
      return [fx(u), fy(u)];
    }, { from: tAnkle, color: skinPaint, name: `foot${side}` });
    b.cards(
      b.surface(legTube).scatter(22, { rng: rng(40 + s), minDist: 0.04, filter: (h) => h.n.y > -0.2 }),
      tuft,
      { size: [0.04, 0.055], lean: 60, bend: 20, flow: [0, -1, 0], vary: 0.3, rng: rng(44 + s), color: limbPaint },
    );
    // toes with webbing
    const footTip = leg.joints[leg.joints.length - 1];
    const toes: Chain[] = [];
    for (let k = 0; k < 5; k++) {
      const a = (k - 2) * 0.34 + s * 0.12;
      const base: [number, number, number] = [ball[0] + (k - 2) * 0.03, 0.184, ball[2] - Math.abs(k - 2) * 0.004];
      const len = 0.08 - Math.abs(k - 2) * 0.006;
      const tip: [number, number, number] = [base[0] + Math.sin(a) * len, 0.18, base[2] + Math.cos(a) * len];
      const toe = b.chain(`toe${side}${k + 1}`, [base, tip], { parent: footTip, names: [`toe${side}${k + 1}`], role: "digit" });
      toes.push(toe);
      b.sweep(toe, [0.017, 0.013], { color: skinPaint, section: { ngon: 6 }, name: `toe${side}${k + 1}` });
    }
    for (let k = 0; k < 4; k++) b.membrane(toes[k], toes[k + 1], { thickness: 0.006, color: "#7d5d5d", detail: 0.5, name: `web${side}${k}` });
  }

  // ---- clam ---------------------------------------------------------------------------------------------------
  const CZ = 0.19;
  const CS = 1.25;
  const OPEN = 22;
  const H0: [number, number, number] = [0, 0.41, CZ];
  const clam = b.joint("clam", { parent: chest, at: H0, dir: [0, 1, 0] });
  const clamLid = b.joint("clamLid", { parent: clam, at: H0, dir: [0, 1, 0], role: "hinge" });
  const shellPaint = paint((_p, _n, s) => {
    const dy = s[1] - 0.02;
    const r = Math.hypot(s[0], dy);
    const ang = Math.atan2(s[0], dy);
    const ring = Math.max(Math.sin(r * 150), 0);
    const rib = Math.sin(ang * 24) * 0.5 + 0.5;
    let c = mix(SHELL, SHELL_L, smoothstep(0.4, 1, rib) * 0.55);
    c = mix(c, SHELL_D, smoothstep(0.55, 0.95, ring) * 0.7);
    c = mix(c, SHELL_D, smoothstep(0.16, 0.19, r) * 0.7);
    return mix(c, CREAM, 1 - smoothstep(0.0, 0.03, r));
  });
  const meatPaint = paint((_p, _n, s) => mix(MEAT, "#ffc6b0", smoothstep(0.3, 1, Math.sin(s[0] * 220) * 0.5 + 0.5) * 0.5));
  const outline = clamOutline(CS);
  const valve = { thickness: 0.034, bevel: 0.015, smoothing: 1, x: [1, 0, 0] as [number, number, number], y: [0, 1, 0] as [number, number, number] };
  b.extrude(outline, { ...valve, at: [0, H0[1], CZ - 0.022], color: shellPaint, bone: clam, name: "valveBack" });
  b.extrude(clamOutline(0.93 * CS), { ...valve, thickness: 0.026, bevel: 0.006, at: [0, H0[1] + 0.004, CZ], color: meatPaint, bone: clam, name: "clamMeat" });
  b.extrude(outline, { ...valve, at: [0, H0[1], CZ + 0.022], color: shellPaint, bone: clamLid, name: "valveLid" });
  blob(0.022, 0.022, 0.022, "#fdf1ee", [0, H0[1] + 0.17, CZ + 0.012], clam, { name: "pearl" });
  blob(0.006, 0.006, 0.006, WHITE, [0.008, H0[1] + 0.178, CZ + 0.03], clam, { name: "pearlShine" });
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.06, 8), "#9a7bc0", { bone: clam, at: [0, H0[1] + 0.003, CZ], rotation: [0, 0, 90], name: "clamHinge" });
  b.pose(clamLid, { axis: [1, 0, 0], deg: OPEN });

  // ---- arms and paws ------------------------------------------------------------------------------------------
  const arms: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.155, 0.625, -0.02];
    const wrist: [number, number, number] = [s * 0.13, 0.5, CZ - 0.01];
    const pts = limb(shoulder, wrist, [0.15, 0.14], [s, -0.5, -0.1]);
    const arm = b.chain(`arm${side}`, pts, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" });
    arms[side] = arm;
    const hand = arm.joints[arm.joints.length - 1];
    const ar = keyed([0.058, 0.052, 0.044]);
    const armTube = b.sweep(arm, (t) => ar(t), { color: limbPaint, name: `arm${side}` });
    b.cards(b.surface(armTube).scatter(26, { rng: rng(50 + s), minDist: 0.04, filter: (h) => h.n.y > -0.3 }), tuft, {
      size: [0.04, 0.055],
      lean: 60,
      bend: 20,
      flow: [0, -1, 0],
      vary: 0.3,
      rng: rng(54 + s),
      color: limbPaint,
    });
    blob(0.046, 0.06, 0.06, skinPaint, [s * 0.128, 0.5, CZ + 0.006], hand, { name: `paw${side}` });
    for (let i = 0; i < 4; i++) {
      const y = 0.455 + i * 0.03;
      const lidZ = CZ + 0.039 + (y - H0[1]) * Math.sin((OPEN * Math.PI) / 180) + 0.012;
      const base: [number, number, number] = [s * 0.126, y, CZ + 0.012];
      const tip: [number, number, number] = [s * 0.084, y + 0.006, lidZ];
      const finger = b.chain(`finger${side}${i + 1}`, [base, tip], { parent: hand, names: [`finger${side}${i + 1}`], role: "digit" });
      b.sweep(finger, [0.0145, 0.011], { color: skinPaint, sides: 6, name: `finger${side}${i + 1}` });
      b.spike(tip, [-s * 0.5, -0.1, 0.8], 0.016, 0.0065, { color: CREAM_D, bone: hand, name: `claw${side}${i + 1}` });
    }
  }

  // ---- kelp belt ----------------------------------------------------------------------------------------------
  const kelpRope = paint((p) => mix(KELP_D, KELP, smoothstep(0.3, 0.7, noise(p, 0.03, 12))));
  const belt = bodySkin.loop([0, 0.37, -0.09], { lift: 0.008 });
  b.sweep(belt, 0.015, { color: kelpRope, sides: 6, name: "kelpBelt" });
  b.along(belt, 9, (at) => b.part(sph(7, 5), "#b3b04b", { at, scale: 0.021, name: "kelpBladder" }));
  const knot = bodySkin.ray([0.08, 0.372, 1], [0, 0, -1]);
  if (knot) {
    b.stick(sph(8, 6), "#9a9f3f", knot, { scale: [0.03, 0.026, 0.026], embed: 0.3, name: "kelpKnot" });
    b.cards([frame(knot.moved([0.012, 0, 0.004]), [0, 1, 0]), frame(knot.moved([-0.012, 0, 0.004]), [0, 1, 0])], kelpTex, {
      size: [0.05, 0.19],
      lean: 180,
      flow: [0, 0, 1],
      bend: 20,
      vary: 0.2,
      rng: rng(61),
    });
  }

  // body fur
  b.cards(
    bodySkin.scatter(380, { rng: rng(11), minDist: 0.03, filter: (h) => h.n.y > -0.4 && h.at.y > 0.33 && h.at.y < 0.7 }),
    tuft,
    { size: [0.04, 0.05], lean: 78, bend: 25, flow: [0, -1, 0], vary: 0.3, rng: rng(12), color: coat },
  );

  // ---- head ---------------------------------------------------------------------------------------------------
  const skull = blob(0.168, 0.13, 0.15, headPaint, [0, 0.765, 0.06], head, { sw: 14, sh: 10, name: "skull" });
  const cheeks: Part[] = [];
  for (const s of [1, -1]) {
    cheeks.push(blob(0.072, 0.056, 0.066, headPaint, [s * 0.056, 0.724, 0.16], head, { sw: 10, sh: 8, name: `cheek${s > 0 ? "L" : "R"}` }));
  }
  const muzzle = blob(0.06, 0.046, 0.05, CREAM, [0, 0.735, 0.205], head, { name: "muzzle" });
  blob(0.032, 0.023, 0.022, NOSE, [0, 0.758, 0.246], head, { name: "nose" });
  blob(0.008, 0.005, 0.005, "#6d5558", [0.009, 0.766, 0.262], head, { name: "noseShine" });
  const lower = blob(0.083, 0.042, 0.082, CREAM, [0, 0.688, 0.172], jaw, { sw: 10, sh: 7, name: "jawLower" });
  blob(0.03, 0.012, 0.03, PINK, [0, 0.718, 0.19], jaw, { name: "tongue" });
  // teeth
  for (const s of [1, -1]) blob(0.008, 0.012, 0.005, WHITE, [s * 0.009, 0.715, 0.243], head, { name: "tooth" });
  // mouth line and philtrum
  const faceSkin = b.surface([cheeks[0], cheeks[1], muzzle, lower]);
  for (const s of [1, -1]) {
    const smile = catmull([
      [0, 0.728, 0.246],
      [s * 0.028, 0.709, 0.236],
      [s * 0.064, 0.714, 0.21],
      [s * 0.097, 0.74, 0.178],
    ]);
    b.sweep(faceSkin.drape(smile, { lift: 0.002 }), [0.0035, 0.0035], { color: NOSE, bone: head, sides: 4, name: "mouthLine" });
  }
  b.rod([0, 0.752, 0.247], [0, 0.728, 0.246], 0.003, { color: NOSE, bone: head, name: "philtrum" });
  // eyes
  for (const s of [1, -1]) {
    blob(0.028, 0.032, 0.022, EYE, [s * 0.078, 0.795, 0.182], head, { sw: 10, sh: 8, name: "eye" });
    blob(0.0095, 0.0095, 0.006, WHITE, [s * 0.072, 0.808, 0.2], head, { sw: 6, sh: 4, name: "eyeShine" });
    blob(0.005, 0.005, 0.004, WHITE, [s * 0.089, 0.786, 0.2], head, { sw: 5, sh: 4, name: "eyeShine2" });
    // happy brows
    b.capsule([s * 0.06, 0.838, 0.178], [s * 0.098, 0.84, 0.158], [0.0065, 0.0055], { color: FUR, bone: head, name: "brow" });
    // ears
    blob(0.022, 0.042, 0.038, FUR, [s * 0.108, 0.852, 0.03], head, { name: "ear" });
    blob(0.012, 0.03, 0.028, PINK, [s * 0.114, 0.85, 0.042], head, { name: "earInner" });
    // blush
    blob(0.026, 0.018, 0.012, BLUSH, [s * 0.112, 0.742, 0.142], head, { dir: [s, 0, 1], name: "blush" });
    // whiskers
    const pad = cheeks[s > 0 ? 0 : 1];
    const padSkin = b.surface(pad);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        const hit = padSkin.around(pad.at).at(s * (28 + c * 20), -4 + r * 14);
        if (!hit) continue;
        b.stick(sph(5, 4), SKIN, hit, { scale: 0.0045, embed: 0.3, name: "whiskerDot" });
        if (c === 0) {
          const dir = [s * 0.85, -0.05 + (r - 1) * 0.18, 0.5];
          const p0 = hit.at;
          const ctrl: [number, number, number] = [p0.x + dir[0] * 0.06, p0.y + dir[1] * 0.06 + 0.012, p0.z + dir[2] * 0.06];
          const tipP: [number, number, number] = [p0.x + dir[0] * 0.13, p0.y + dir[1] * 0.13 - 0.025, p0.z + dir[2] * 0.13];
          b.sweep(bezier(p0, ctrl, tipP), [0.0035, 0.001], { color: WHITE, bone: head, sides: 4, name: "whisker" });
        }
      }
    }
  }
  // head fur: cheek ruff and crown
  const headSkin = b.surface(skull);
  b.cards(
    headSkin.scatter(70, { rng: rng(71), minDist: 0.032, filter: (h) => h.n.z < 0.4 && h.n.y > -0.2 && h.at.y > 0.7 && h.at.z < 0.1 }),
    tuft,
    { size: [0.042, 0.048], lean: 82, bend: 20, flow: [0, -0.5, -1], vary: 0.3, rng: rng(72), color: headPaint },
  );
  // cheek and chin ruff
  const faceHits = b.surface([cheeks[0], cheeks[1], lower]);
  b.cards(
    faceHits.scatter(46, { rng: rng(75), minDist: 0.03, filter: (h) => h.n.y < 0.35 && h.n.z < 0.8 && h.at.y < 0.74 }),
    tuft,
    { size: [0.04, 0.045], lean: 75, bend: 20, flow: [0, -1, -0.3], vary: 0.25, rng: rng(76), color: CREAM_D },
  );
  // cowlick
  b.cards(
    [0, 1, 2].map((i) => frame([(i - 1) * 0.022, 0.888, 0.075 - Math.abs(i - 1) * 0.015], [(i - 1) * 0.35, 1, 0.2])),
    tuft,
    { size: [0.04, 0.085], lean: 20, bend: 35, flow: [0, 0, 1], color: FUR, bone: head },
  );

  // little water droplets on the fur
  b.part(sph(6, 4), "#d2f1fa", { bone: head, at: [-0.09, 0.855, 0.12], scale: [0.009, 0.011, 0.007], name: "droplet" });
  b.part(sph(6, 4), "#d2f1fa", { bone: head, at: [0.07, 0.872, 0.09], scale: [0.007, 0.009, 0.006], name: "droplet" });
  b.part(sph(6, 4), "#d2f1fa", { bone: chest, at: [-0.13, 0.66, 0.08], scale: [0.009, 0.012, 0.007], name: "droplet" });

  // ---- props on the rock ---------------------------------------------------------------------------------------
  // starfish
  const starPts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.07 : 0.028;
    starPts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  b.extrude(starPts, {
    at: [0.3, 0.172, 0.08],
    x: [Math.cos(0.5), 0, -Math.sin(0.5)],
    y: [Math.sin(0.5), 0, Math.cos(0.5)],
    thickness: 0.014,
    bevel: 0.004,
    smoothing: 1,
    color: spots(STAR, STAR_D, { size: 0.02, amount: 0.5 }),
    detail: 0.4,
    bone: root,
    name: "starfish",
  });
  // cracked shell halves
  for (const [x, z, rot] of [
    [-0.24, -0.3, 0.7],
    [-0.32, -0.24, 2.4],
  ] as const) {
    b.extrude(clamOutline(0.55), {
      at: [x, 0.178, z],
      x: [Math.cos(rot), 0, -Math.sin(rot)],
      y: [Math.sin(rot), 0, Math.cos(rot)],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      color: shellPaint,
      detail: 0.4,
      bone: root,
      name: "shellHalf",
    });
  }
  // pebbles
  for (const [x, z, r] of [
    [0.22, -0.32, 0.03],
    [0.27, -0.27, 0.02],
    [-0.2, 0.33, 0.022],
    [0.1, 0.31, 0.017],
  ] as const) {
    b.part(boulder([0, 0, 0], [r, r * 0.7, r], 0.15, 1), paint((p) => mix("#a3a7b1", "#7f8594", noise(p, 0.02, 3))), {
      bone: root,
      at: [x, 0.17 + r * 0.45, z],
      flat: true,
      name: "pebble",
    });
  }
  // crab
  const cx = 0.0;
  const cz = 0.36;
  const cy = 0.17;
  b.part(sph(10, 7), CRAB, { bone: root, at: [cx, cy + 0.022, cz], scale: [0.042, 0.02, 0.03], name: "crabBody" });
  for (const s of [1, -1]) {
    b.rod([cx + s * 0.012, cy + 0.03, cz + 0.022], [cx + s * 0.014, cy + 0.052, cz + 0.026], 0.0035, { color: CRAB, bone: root, name: "crabEyeStalk" });
    b.part(sph(6, 5), EYE, { bone: root, at: [cx + s * 0.014, cy + 0.056, cz + 0.028], scale: 0.007, name: "crabEye" });
    b.capsule([cx + s * 0.038, cy + 0.024, cz + 0.014], [cx + s * 0.062, cy + 0.052, cz + 0.04], 0.0055, { color: CRAB, bone: root, name: "crabArm" });
    b.part(sph(8, 6), CRAB, { bone: root, at: [cx + s * 0.066, cy + 0.062, cz + 0.046], scale: [0.017, 0.015, 0.012], name: "crabClaw" });
    b.spike([cx + s * 0.072, cy + 0.072, cz + 0.05], [s * 0.3, 1, 0.3], 0.016, 0.006, { color: CRAB, bone: root, name: "crabPincer" });
    for (let k = 0; k < 3; k++) {
      const zz = cz - 0.014 + k * 0.014;
      b.capsule([cx + s * 0.03, cy + 0.02, zz], [cx + s * 0.062, cy + 0.006, zz + 0.008], 0.0032, { color: CRAB, bone: root, name: "crabLeg" });
    }
  }

  return b.root;
}
