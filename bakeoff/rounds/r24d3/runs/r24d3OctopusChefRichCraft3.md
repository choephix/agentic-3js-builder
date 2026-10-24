```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  aim,
  catmull,
  countershade,
  spots,
  mottle,
  grain,
  stripes,
  paint,
  svg,
} from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Octopus Chef",
  description:
    "A Pixar-style octopus chef with a toque, handlebar moustache and apron, juggling copper and steel pans, a whisk and a spatula with its eight arms while eggs, pancakes and veggies fly.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const CORAL = "#ee6a45";
const CORAL_L = "#f78c58";
const CORAL_D = "#c9423a";
const PALE = "#ffcaa6";
const SUCK = "#ffe3d2";
const EYEWHITE = "#fffaf2";
const INKP = "#3a1f2c";
const BROWN = "#5a3320";
const BROWN_L = "#82502d";
const MOUTH = "#6e1a2a";
const TEETH = "#fffdf5";
const TONGUE = "#f0687c";
const LIP = "#f2765e";
const RED = "#d9382b";
const CREAM = "#fdf3e0";
const GOLD = "#ffc83a";
const NONSTICK = "#2f2a28";
const YOLK = "#ffb41e";
const BUTTER = "#ffe27a";
const SYRUP = "#8a3f12";
const PEPPER = "#e8452f";
const CARROT = "#f08a24";
const PEA = "#7cc14a";
const SHROOM = "#efe0c6";
const LEAF = "#3f9a45";
const CHILI = "#c9231f";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "octopus_chef" });
  const rand = rng(7);

  // ---------------------------------------------------------------- paints
  const SKIN = countershade(
    spots(mottle(CORAL, CORAL_L, { size: 0.2, seed: 3 }), CORAL_D, { size: 0.075, amount: 0.3, seed: 5 }),
    PALE,
    { level: -0.5, soft: 0.4 },
  );
  const TENT = countershade(
    spots(mottle(CORAL, CORAL_L, { size: 0.2, seed: 3 }), CORAL_D, { size: 0.06, amount: 0.3, seed: 5 }),
    PALE,
    { level: -0.25, soft: 0.3 },
  );
  const COPPER = metal("copper", { polish: 0.5, tarnish: 0.15 });
  const STEELP = metal("steel", { polish: 0.6 });
  const IRONP = metal("iron");
  const WOODP = grain("#8a5a34", "#5e3a20", { size: 0.012, axis: "y" });
  const MUST = grain(BROWN, BROWN_L, { size: 0.012, axis: "x" });
  const HATP = countershade(WHITE, "#c9d3ea", { level: -0.1, soft: 0.55 });
  const PLEAT = paint((_p, _n, s) => (((Math.floor(s[1] / 10) % 2) + 2) % 2 === 0 ? "#ffffff" : "#e3e9f5"));
  const CHECK = paint((p) =>
    ((Math.floor(p.x / 0.035) + Math.floor(p.y / 0.035) + Math.floor(p.z / 0.035)) & 1) === 0 ? RED : CREAM,
  );
  const PANCAKE = countershade("#d99545", "#f1c47a", { level: 0.3, soft: 0.4 });
  const SHRIMP = stripes("#ff9566", "#ef5f3e", { size: 0.02, axis: "y", width: 0.4 });
  const SPAT = paint((_p, _n, s) => {
    const slot = s[1] > 0.05 && s[1] < 0.13 && Math.abs(s[0]) < 0.04 && Math.floor((s[0] + 0.04) / 0.016) % 2 === 0;
    return slot ? "#2a2430" : STEELP;
  });

  // ---------------------------------------------------------------- textures
  const IRIS = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="i" cx="0.5" cy="0.58" r="0.55"><stop offset="0.35" stop-color="#e09a42"/><stop offset="0.8" stop-color="#8a4a1c"/><stop offset="1" stop-color="#4a2410"/></radialGradient></defs>
    <circle cx="50" cy="50" r="49" fill="#24120c"/>
    <circle cx="50" cy="50" r="44" fill="url(#i)"/>
    <circle cx="50" cy="50" r="22" fill="#0b0508"/>
    <ellipse cx="34" cy="31" rx="12" ry="14" fill="#ffffff"/>
    <circle cx="67" cy="67" r="6" fill="#ffffff"/>
  </svg>`,
    { size: 192 },
  );
  const BLUSH = svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="35" rx="48" ry="32" fill="#ff6f8e"/>
    <path d="M26 20 L36 48 M46 16 L56 50 M66 20 L74 46" stroke="#ff9bb0" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );
  const APRON = svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2 L78 2 L97 70 Q90 78 82 72 Q74 79 66 73 Q58 79 50 73 Q42 79 34 73 Q26 79 18 72 Q10 78 3 70 Z" fill="#fff8ea" stroke="#d9402e" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M30 6 L19 70 M40 6 L33 72 M50 6 L50 73 M60 6 L67 72 M70 6 L81 70" stroke="#f1dfc0" stroke-width="1.6"/>
    <rect x="22" y="2" width="56" height="6" fill="#d9402e"/>
    <path d="M32 40 H68 V63 Q50 69 32 63 Z" fill="#ffffff" stroke="#d9402e" stroke-width="2.4" stroke-linejoin="round"/>
    <rect x="41" y="28" width="3.4" height="20" rx="1.7" fill="#8a5a34"/><ellipse cx="42.7" cy="27" rx="5" ry="6" fill="#aab3c2"/>
    <rect x="56" y="30" width="3.4" height="18" rx="1.7" fill="#8a5a34"/><path d="M53 26 H62 V32 H53Z" fill="#aab3c2"/>
    <text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="bold" font-size="9" fill="#d9402e">CHEF</text>
  </svg>`,
    { size: 256 },
  );
  const EGG = svg(
    `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 4 C70 2 92 14 94 38 C96 60 80 84 54 86 C30 88 6 76 6 52 C6 30 24 6 50 4Z" fill="#fffdf2" stroke="#ecd9a0" stroke-width="3"/>
    <path d="M20 30 Q30 14 46 12" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );
  const TOMATO = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#e23b2a"/><circle cx="50" cy="50" r="40" fill="#f0604a"/>
    <path d="M50 50 L50 14 M50 50 L81 68 M50 50 L19 68" stroke="#e23b2a" stroke-width="5"/>
    <g fill="#fbd9a0"><ellipse cx="38" cy="32" rx="4" ry="6"/><ellipse cx="62" cy="32" rx="4" ry="6"/><ellipse cx="72" cy="58" rx="6" ry="4"/><ellipse cx="50" cy="76" rx="6" ry="4"/><ellipse cx="28" cy="58" rx="6" ry="4"/></g>
  </svg>`,
    { size: 96 },
  );
  const PUFF = svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg"><g fill="#f6f9fc">
    <circle cx="30" cy="80" r="17"/><circle cx="24" cy="58" r="14"/><circle cx="36" cy="38" r="12"/><circle cx="28" cy="18" r="10"/></g></svg>`,
    { size: 128 },
  );
  const STAR = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39Z" fill="#ffd54a"/>
    <path d="M50 22 L56 44 L78 50 L56 56 L50 78 L44 56 L22 50 L44 44Z" fill="#fffbe0"/></svg>`,
    { size: 96 },
  );

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.28, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.28, 0],
      [0, 0.45, 0],
      [0, 0.62, -0.01],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.62, -0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.56, 0.1], aim: [0, 0.52, 0.28], role: "jaw" });

  // ---------------------------------------------------------------- body
  const base = b.part(new THREE.SphereGeometry(1, 20, 14), SKIN, {
    bone: hips,
    at: [0, 0.27, 0],
    scale: [0.36, 0.24, 0.36],
  });
  const HC = V(0, 0.72, -0.02);
  const skull = b.part(new THREE.SphereGeometry(1, 22, 16), SKIN, { bone: head, at: HC, scale: [0.31, 0.35, 0.32] });
  const skin = b.surface(skull);
  const F = (x: number, y: number, lift = 0) => {
    const h = skin.ray([x, y, 1.5], [0, 0, -1]);
    return V(x, y, (h ? h.at.z : 0.2) + lift);
  };

  // ---------------------------------------------------------------- face
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ec = F(s * 0.125, 0.8);
    ec.z -= 0.05;
    const ball = b.part(new THREE.SphereGeometry(0.092, 16, 12), EYEWHITE, { bone: head, at: ec });
    const gaze = V(-s * 0.04, -0.03, 1).normalize();
    const eh = b.surface(ball).ray(ec.clone().addScaledVector(gaze, 0.5), gaze.clone().negate());
    b.decal(ball, IRIS, {
      at: eh ? eh.at : ec.clone().addScaledVector(gaze, 0.092),
      dir: gaze,
      size: [0.088, 0.088],
      segments: 8,
      lift: 0.0015,
      bone: head,
    });
    // eyelid with lash line
    const lid = b.joint(`lid${side}`, { parent: head, at: ec, dir: [0, 1, 0], role: "hinge" });
    const lq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.26, 0, -s * 0.2));
    const pole = V(0, 1, 0).applyQuaternion(lq);
    b.part(new THREE.SphereGeometry(0.1, 16, 8, 0, Math.PI * 2, 0, 1.0), SKIN, { bone: lid, at: ec, quat: lq });
    const lash = new THREE.TorusGeometry(0.1 * Math.sin(1.0), 0.0065, 5, 20);
    lash.rotateX(Math.PI / 2);
    b.part(lash, INKP, { bone: lid, at: ec.clone().addScaledVector(pole, 0.1 * Math.cos(1.0)), quat: lq });
    // brow
    const brow = [
      [0.07, 0.935],
      [0.135, 0.97],
      [0.205, 0.93],
    ].map(([x, y]) => F(s * x, y, 0.014));
    b.sweep(catmull(brow), [0.025, 0.011], { color: MUST, bone: head });
    // blush
    b.decal(skull, BLUSH, {
      at: F(s * 0.235, 0.69),
      dir: V(s * 0.55, 0, 1).normalize(),
      size: [0.075, 0.05],
      segments: 6,
      bone: head,
    });
    // handlebar moustache
    const must = [
      [0.0, 0.628],
      [0.06, 0.608],
      [0.12, 0.605],
      [0.175, 0.622],
      [0.205, 0.65],
      [0.2, 0.675],
    ].map(([x, y]) => F(s * x, y, 0.025));
    b.sweep(catmull(must), (t) => 0.01 + 0.024 * Math.pow(1 - t, 0.9), { color: MUST, bone: head });
  }

  // mouth: dark cavity, buck teeth, lower jaw lip + tongue
  const mz = F(0, 0.575).z;
  b.part(new THREE.SphereGeometry(1, 14, 10), MOUTH, {
    bone: head,
    at: [0, 0.575, mz - 0.03],
    scale: [0.09, 0.05, 0.05],
  });
  for (const x of [-0.0165, 0.0165])
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.012), TEETH, { bone: head, at: [x, 0.585, mz + 0.02] });
  const jz = F(0, 0.5).z;
  b.part(new THREE.SphereGeometry(1, 14, 10), LIP, {
    bone: jaw,
    at: [0, 0.505, jz - 0.03],
    scale: [0.105, 0.04, 0.058],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), TONGUE, {
    bone: jaw,
    at: [0, 0.545, mz],
    scale: [0.045, 0.013, 0.032],
  });

  // ---------------------------------------------------------------- chef hat
  const HAT0 = V(0, 0.98, -0.02);
  const HQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, 0, -0.13));
  const hp = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(HQ).add(HAT0);
  const hatAxis = V(0, 1, 0).applyQuaternion(HQ);
  const hat = b.joint("hat", { parent: head, at: HAT0, dir: hatAxis });
  b.lathe(
    [
      [0, 0],
      [0.205, 0],
      [0.21, 0.012],
      [0.205, 0.115],
      [0, 0.115],
    ],
    { at: HAT0, axis: hatAxis, segments: 24, color: PLEAT, bone: hat },
  );
  const trim = new THREE.TorusGeometry(0.205, 0.012, 5, 24);
  trim.rotateX(Math.PI / 2);
  b.part(trim, RED, { bone: hat, at: hp(0, 0.012, 0), quat: HQ });
  const puff = (x: number, y: number, z: number, r: number, sy = 1) =>
    b.part(new THREE.SphereGeometry(1, 14, 10), HATP, {
      bone: hat,
      at: hp(x, y, z),
      scale: [r, r * sy, r],
      quat: HQ,
    });
  puff(0, 0.24, 0, 0.2, 0.95);
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    puff(Math.sin(a) * 0.15, 0.15 + (k % 2) * 0.04, Math.cos(a) * 0.15, 0.105);
  }
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + 0.4;
    puff(Math.sin(a) * 0.09, 0.36, Math.cos(a) * 0.09, 0.1);
  }
  puff(0, 0.43, 0, 0.11);
  const star: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.013 : 0.03;
    const ang = Math.PI / 2 + (i * Math.PI) / 5;
    star.push([Math.cos(ang) * r, Math.sin(ang) * r]);
  }
  b.extrude(star, { at: hp(0, 0.058, 0.212), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: GOLD, bone: hat });

  // ---------------------------------------------------------------- neckerchief + apron
  const neck = new THREE.TorusGeometry(0.22, 0.04, 8, 28);
  neck.rotateX(Math.PI / 2);
  b.part(neck, CHECK, { bone: head, at: [0, 0.465, -0.005] });
  b.part(new THREE.SphereGeometry(0.045, 10, 8), RED, { bone: head, at: [0, 0.46, 0.245] });
  for (const s of [1, -1])
    b.extrude(
      [
        [0, 0],
        [0.07, 0.02],
        [0.09, -0.12],
      ],
      { at: [0, 0.44, 0.262], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.012, color: CHECK, bone: head },
    );
  b.decal(base, APRON, {
    at: [0, 0.27, 0.34],
    dir: [0, 0, 1],
    size: [0.5, 0.4],
    segments: 12,
    lift: 0.002,
    bone: hips,
  });

  // ---------------------------------------------------------------- tentacle helpers
  const baseSkin = b.surface(base);
  const polar = (deg: number, r: number, y: number) => {
    const t = (deg * Math.PI) / 180;
    return V(Math.sin(t) * r, y, Math.cos(t) * r);
  };
  const cup = (rs: number): [number, number][] =>
    (
      [
        [0, 0],
        [0.5, 0],
        [1, 0.3],
        [1, 0.55],
        [0.65, 0.5],
        [0, 0.35],
      ] as [number, number][]
    ).map(([x, y]) => [x * rs, y * rs * 0.5]);

  function arm(
    name: string,
    rootAt: THREE.Vector3,
    pts: THREE.Vector3[],
    rEnd: number,
    count: number,
    t0: number,
    t1: number,
    angle: number,
  ) {
    const hit = baseSkin.nearest(rootAt);
    const res = b.sprout(name, hit, catmull([hit.at, ...pts]), (t: number) => rEnd + (0.088 - rEnd) * Math.pow(1 - t, 1.25), {
      count,
      role: "tentacle",
      color: TENT,
    });
    const sw = res.sweep;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = t0 + ((t1 - t0) * i) / (n - 1);
      const f = sw.at(t, angle);
      b.lathe(cup(f.radius * 0.5), { at: f.moved([0, -0.004, 0]), axis: f, segments: 8, color: SUCK });
    }
    const joints = res.chain!.joints;
    return { tip: joints[joints.length - 1] as Joint };
  }

  function floorArm(name: string, theta: number, len: number, curl: number) {
    const th = (theta * Math.PI) / 180;
    const rd = V(Math.sin(th), 0, Math.cos(th));
    const lt = V(Math.cos(th), 0, -Math.sin(th));
    const spec = [
      [0.55, 0.075, 0.04],
      [0.78, 0.058, -0.08],
      [1.0, 0.05, 0.08],
      [1.15, 0.08, 0.2],
      [1.18, 0.17, 0.32],
      [1.08, 0.25, 0.38],
    ];
    const pts = spec.map(([r, y, l]) => rd.clone().multiplyScalar(r * len).addScaledVector(lt, l * curl).add(V(0, y, 0)));
    return arm(name, polar(theta, 0.36, 0.14), pts, 0.01, 6, 0.4, 0.95, curl * 100);
  }

  // ---------------------------------------------------------------- pans
  type PanSpec = { P: THREE.Vector3; u: THREE.Vector3; h: THREE.Vector3; R: number };
  const panFromGrip = (g: THREE.Vector3, hRough: THREE.Vector3, uRough: THREE.Vector3, R: number): PanSpec => {
    const u = uRough.clone().normalize();
    const h = hRough.clone().addScaledVector(u, -hRough.dot(u)).normalize();
    const P = g.clone().addScaledVector(h, -(0.2 + 0.9 * R)).addScaledVector(u, -0.045);
    return { P, u, h, R };
  };
  const panAt = (P: THREE.Vector3, uRough: THREE.Vector3, hRough: THREE.Vector3, R: number): PanSpec => {
    const u = uRough.clone().normalize();
    const h = hRough.clone().addScaledVector(u, -hRough.dot(u)).normalize();
    return { P, u, h, R };
  };
  function buildPan(sp: PanSpec, bone: Joint, shell: typeof COPPER) {
    const { P, u, h, R } = sp;
    const o: [number, number][] = [
      [0, 0],
      [R * 0.68, 0],
      [R * 0.95, R * 0.26],
      [R, R * 0.3],
      [R * 0.93, R * 0.3],
      [R * 0.66, 0.012],
      [0, 0.012],
    ];
    b.lathe(o, { at: P, axis: u, segments: 22, color: shell, bone });
    b.part(new THREE.CylinderGeometry(R * 0.64, R * 0.64, 0.004, 22), NONSTICK, {
      bone,
      at: P.clone().addScaledVector(u, 0.0135),
      dir: u,
    });
    const a = P.clone().addScaledVector(u, 0.045).addScaledVector(h, R * 0.9);
    const e = a.clone().addScaledVector(h, 0.3);
    b.rod(a, a.clone().addScaledVector(h, 0.12), [0.02, 0.015], { color: IRONP, bone });
    b.rod(a.clone().addScaledVector(h, 0.1), e, [0.02, 0.024], { color: WOODP, bone });
    b.part(new THREE.SphereGeometry(0.025, 8, 6), WOODP, { bone, at: e });
    const hole = new THREE.TorusGeometry(0.009, 0.004, 4, 8);
    b.part(hole, IRONP, { bone, at: e.clone().addScaledVector(h, 0.02), dir: u, axis: "z" });
  }
  function wrap(g: THREE.Vector3, h: THREE.Vector3, bone: Joint) {
    for (const d of [-0.035, 0, 0.035])
      b.part(new THREE.TorusGeometry(0.03, 0.017, 6, 12), TENT, {
        bone,
        at: g.clone().addScaledVector(h, d),
        dir: h,
        axis: "z",
      });
  }
  const sideOf = (sp: PanSpec) => sp.u.clone().cross(sp.h).normalize();

  // ---------------------------------------------------------------- arm A (+X): copper pan with fried egg
  const gA = V(0.8, 1.4, 0.08);
  const spA = panFromGrip(gA, V(0.8, -0.05, -0.6), V(-0.1, 1, 0.35), 0.16);
  const armA = arm(
    "tentA",
    polar(80, 0.36, 0.2),
    [V(0.6, 0.32, 0.05), V(0.84, 0.62, 0.08), V(0.96, 0.98, 0.09), V(0.9, 1.24, 0.1), gA],
    0.028,
    6,
    0.18,
    0.82,
    180,
  );
  buildPan(spA, armA.tip, COPPER);
  wrap(gA, spA.h, armA.tip);
  {
    const eggAt = spA.P.clone().addScaledVector(spA.u, 0.0165);
    b.part(new THREE.PlaneGeometry(0.15, 0.135), WHITE, {
      bone: armA.tip,
      at: eggAt,
      dir: spA.u,
      axis: "z",
      up: spA.h,
      texture: EGG,
    });
    const yp = eggAt.clone().addScaledVector(spA.u, 0.012).addScaledVector(spA.h, 0.01);
    b.part(new THREE.SphereGeometry(0.03, 10, 8), YOLK, { bone: armA.tip, at: yp, scale: [1, 0.55, 1], dir: spA.u });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), WHITE, {
      bone: armA.tip,
      at: yp.clone().addScaledVector(spA.u, 0.012).addScaledVector(sideOf(spA), 0.01),
    });
  }
  b.cards(
    [0, 1, 2, 3, 4].map((i) =>
      frame(
        spA.P.clone()
          .addScaledVector(spA.u, 0.08 + i * 0.015)
          .addScaledVector(sideOf(spA), (i - 2) * 0.04),
        [0, 1, 0],
      ),
    ),
    PUFF,
    { size: [0.07, 0.13], cross: true, bend: 20, vary: 0.25, rng: rand, bone: armA.tip },
  );

  // ---------------------------------------------------------------- arm B (-X): steel pan with pancakes
  const gB = V(-0.82, 1.3, 0.12);
  const spB = panFromGrip(gB, V(-0.8, 0, -0.55), V(0.15, 1, 0.4), 0.16);
  const armB = arm(
    "tentB",
    polar(-80, 0.36, 0.2),
    [V(-0.62, 0.34, 0.02), V(-0.88, 0.58, 0.0), V(-1.0, 0.92, 0.06), V(-0.95, 1.15, 0.12), gB],
    0.028,
    6,
    0.18,
    0.82,
    180,
  );
  buildPan(spB, armB.tip, STEELP);
  wrap(gB, spB.h, armB.tip);
  {
    const sB = sideOf(spB);
    for (let i = 0; i < 3; i++)
      b.part(new THREE.CylinderGeometry(0.092 - i * 0.004, 0.092 - i * 0.004, 0.02, 18), PANCAKE, {
        bone: armB.tip,
        at: spB.P.clone().addScaledVector(spB.u, 0.027 + 0.021 * i),
        dir: spB.u,
      });
    const top = spB.P.clone().addScaledVector(spB.u, 0.027 + 0.021 * 2 + 0.011);
    b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.004, 16), SYRUP, { bone: armB.tip, at: top, dir: spB.u });
    b.part(new THREE.BoxGeometry(0.04, 0.014, 0.04), BUTTER, {
      bone: armB.tip,
      at: top.clone().addScaledVector(spB.u, 0.01),
      dir: spB.u,
    });
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + 0.5;
      b.part(new THREE.SphereGeometry(0.012, 6, 5), SYRUP, {
        bone: armB.tip,
        at: spB.P.clone()
          .addScaledVector(spB.u, 0.06)
          .addScaledVector(spB.h, Math.cos(a) * 0.088)
          .addScaledVector(sB, Math.sin(a) * 0.088),
        scale: [1, 1.7, 1],
        dir: spB.u,
      });
    }
  }
  // flying pancake
  {
    const c = spB.P.clone().addScaledVector(spB.u, 0.42).addScaledVector(spB.h, 0.05);
    const fly = b.joint("flyPancake", { parent: hips, at: c });
    const td = spB.u.clone().add(V(0.5, 0, -0.3)).normalize();
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 18), PANCAKE, { bone: fly, at: c, dir: td });
    b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.004, 16), SYRUP, {
      bone: fly,
      at: c.clone().addScaledVector(td, 0.011),
      dir: td,
    });
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.035), BUTTER, {
      bone: fly,
      at: c.clone().addScaledVector(td, 0.02),
      dir: td,
    });
  }

  // ---------------------------------------------------------------- arm C: whisk
  const gC = V(0.46, 0.86, 0.74);
  const dC = V(-0.12, 1, 0.08).normalize();
  const armC = arm(
    "tentC",
    polar(52, 0.36, 0.17),
    [V(0.5, 0.1, 0.42), V(0.62, 0.28, 0.62), V(0.6, 0.55, 0.76), gC],
    0.028,
    5,
    0.18,
    0.82,
    180,
  );
  wrap(gC, dC, armC.tip);
  {
    b.rod(gC.clone().addScaledVector(dC, -0.06), gC.clone().addScaledVector(dC, 0.13), 0.017, { color: WOODP, bone: armC.tip });
    const fer = gC.clone().addScaledVector(dC, 0.13);
    b.rod(fer, fer.clone().addScaledVector(dC, 0.04), [0.02, 0.014], { color: STEELP, bone: armC.tip });
    const q0 = aim(dC);
    const centre = fer.clone().addScaledVector(dC, 0.04 + 0.0765);
    for (let k = 0; k < 6; k++) {
      const q = q0.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (k * Math.PI) / 6));
      b.part(new THREE.TorusGeometry(0.045, 0.0035, 4, 16), STEELP, {
        bone: armC.tip,
        at: centre,
        quat: q,
        scale: [0.55, 1.7, 1],
      });
    }
  }

  // ---------------------------------------------------------------- arm D: spatula
  const gD = V(-0.5, 0.84, 0.74);
  const dD = V(0.1, 1, 0.1).normalize();
  const armD = arm(
    "tentD",
    polar(-52, 0.36, 0.17),
    [V(-0.5, 0.1, 0.42), V(-0.62, 0.28, 0.62), V(-0.6, 0.55, 0.76), gD],
    0.028,
    5,
    0.18,
    0.82,
    180,
  );
  wrap(gD, dD, armD.tip);
  {
    b.rod(gD.clone().addScaledVector(dD, -0.06), gD.clone().addScaledVector(dD, 0.13), 0.016, { color: WOODP, bone: armD.tip });
    const n0 = gD.clone().addScaledVector(dD, 0.13);
    const n1 = gD.clone().addScaledVector(dD, 0.22);
    b.rod(n0, n1, 0.007, { color: STEELP, bone: armD.tip });
    b.extrude(
      [
        [-0.012, 0],
        [0.012, 0],
        [0.05, 0.03],
        [0.05, 0.15],
        [-0.05, 0.15],
        [-0.05, 0.03],
      ],
      { at: n1, x: [1, 0, 0], y: dD, thickness: 0.008, bevel: 0.002, color: SPAT, bone: armD.tip },
    );
  }

  // ---------------------------------------------------------------- floor arms
  floorArm("tentE", 115, 1.0, 1);
  floorArm("tentF", -115, 0.95, -1);
  floorArm("tentG", 155, 0.9, -1);
  floorArm("tentH", -155, 1.05, 1);

  // ---------------------------------------------------------------- juggled pans
  const spC = panAt(V(0.12, 1.68, 0.2), V(0.25, 0.8, 0.55), V(0.6, 0.2, -0.7), 0.15);
  const spD = panAt(V(-0.3, 1.78, 0.22), V(-0.3, 0.8, 0.5), V(-0.7, 0.1, -0.55), 0.15);
  const airC = b.joint("juggleC", { parent: hips, at: spC.P });
  const airD = b.joint("juggleD", { parent: hips, at: spD.P });
  buildPan(spC, airC, COPPER);
  buildPan(spD, airD, STEELP);

  const scatterAbove = (sp: PanSpec) => {
    const side = sideOf(sp);
    return sp.P.clone()
      .addScaledVector(sp.u, 0.12 + rand() * 0.32)
      .addScaledVector(sp.h, (rand() - 0.5) * 0.24)
      .addScaledVector(side, (rand() - 0.5) * 0.24);
  };
  const spin = (): [number, number, number] => [rand() * 360, rand() * 360, rand() * 360];
  // veggies over pan C
  for (let i = 0; i < 12; i++) {
    const pos = scatterAbove(spC);
    if (i % 4 === 0)
      b.part(new THREE.BoxGeometry(0.036, 0.014, 0.036), PEPPER, { bone: airC, at: pos, rotation: spin() });
    else if (i % 4 === 1)
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.013, 8), CARROT, { bone: airC, at: pos, rotation: spin() });
    else if (i % 4 === 2) b.part(new THREE.SphereGeometry(0.013, 6, 5), PEA, { bone: airC, at: pos });
    else
      b.part(new THREE.CylinderGeometry(0.024, 0.016, 0.012, 8), SHROOM, { bone: airC, at: pos, rotation: spin() });
  }
  // tomato, shrimp, chili, basil over pan D
  {
    const sD = sideOf(spD);
    for (let i = 0; i < 3; i++)
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 14), WHITE, {
        bone: airD,
        at: scatterAbove(spD),
        rotation: spin(),
        texture: TOMATO,
      });
    for (let i = 0; i < 2; i++) {
      const p0 = scatterAbove(spD);
      b.sweep(
        catmull([
          p0,
          p0.clone().addScaledVector(spD.h, 0.045).addScaledVector(spD.u, 0.035),
          p0.clone().addScaledVector(spD.h, 0.07),
          p0.clone().addScaledVector(spD.h, 0.055).addScaledVector(spD.u, -0.04),
        ]),
        [0.02, 0.005],
        { color: SHRIMP, bone: airD },
      );
    }
    for (let i = 0; i < 2; i++) {
      const p0 = scatterAbove(spD);
      const d = spD.h.clone().addScaledVector(sD, (i - 0.5) * 1.2).normalize();
      b.spike(p0, d, 0.07, 0.014, { color: CHILI, bone: airD });
      b.spike(p0, d.clone().negate(), 0.02, 0.006, { color: LEAF, bone: airD });
    }
    for (let i = 0; i < 2; i++) {
      b.extrude(
        [
          [0, 0],
          [0.02, 0.02],
          [0.022, 0.05],
          [0, 0.085],
          [-0.022, 0.05],
          [-0.02, 0.02],
        ],
        { at: scatterAbove(spD), x: sD, y: spD.h, thickness: 0.004, color: LEAF, bone: airD, smoothing: 1 },
      );
    }
  }

  // ---------------------------------------------------------------- sparkles & motion
  const sparkAt: [number, number, number][] = [
    [0.35, 1.95, 0.35],
    [-0.05, 1.93, 0.45],
    [-0.58, 1.74, 0.5],
    [0.55, 1.85, 0.1],
    [-0.68, 1.95, 0.1],
    [0.82, 1.68, 0.5],
    [-0.92, 1.55, 0.45],
    [0.2, 1.52, 0.62],
    [-0.2, 1.45, 0.6],
  ];
  glow(
    b.cards(
      sparkAt.map((p) => frame(p, [0, 1, 0])),
      STAR,
      { size: 0.09, vary: 0.35, rng: rand, bone: hips },
    ),
    1.4,
  );

  return b.root;
}
```