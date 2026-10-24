```ts
import * as THREE from "three";
import { createBuilder, frame, rng, aim, catmull, spiral, countershade, mottle, spots, paint, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Chef Octavio",
  description:
    "A Pixar-style octopus chef in a tilted toque and striped apron, with a handlebar mustache, juggling pans: two held in tentacles, two tossed in the air (one flambéing), a pancake mid-flip, a spinning lid, and a ladle and spatula held by his floor arms.",
};

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
type Pt = [number, number];

// ---- palette ----
const WHITE = "#fbf8ee";
const RED = "#d9382f";
const DARK = "#3b2418";
const WOOD = "#9a6234";
const WOOD_D = "#6e4224";
const SUCKER = "#ffd8c4";
const LIP = "#ff8a75";
const EYEWHITE = "#fffdf6";
const STEEL_C = "#aab4c6";

// ---- paints (module level so every part continues one field) ----
const COAT = countershade(
  spots(mottle("#ef6045", "#f8794f", { size: 0.14, seed: 3 }), "#d84a3b", { size: 0.075, amount: 0.35, seed: 5 }),
  mottle("#ffb792", "#ffcba5", { size: 0.1, seed: 4 }),
  { level: -0.25, soft: 0.4 },
);
const HATP = countershade("#ffffff", "#cfd6ea", { level: -0.2, soft: 0.6 });
const APRON = paint((p) => {
  if (p.y < 0.275) return RED;
  const k = Math.floor(Math.atan2(p.x, p.z) / (Math.PI / 10));
  return (k % 2 + 2) % 2 ? "#f6f2e4" : "#bcd8ee";
});
const IRON = metal("iron", { polish: 0.45 });
const COPPER = metal("copper", { verdigris: 0.15 });
const STEEL = metal("steel");
const PANCAKE = mottle("#e6aa50", "#c98532", { size: 0.04, seed: 9 });

// ---- textures ----
const EYE_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="42" cy="46" r="31" fill="#17506f"/>
  <circle cx="42" cy="46" r="27.5" fill="#2fa6c9"/>
  <ellipse cx="42" cy="60" rx="18" ry="10" fill="#79dcea"/>
  <circle cx="42" cy="46" r="14.5" fill="#0a1220"/>
  <circle cx="32" cy="35" r="7.5" fill="#ffffff"/>
  <circle cx="51" cy="56" r="3.4" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);
const EGG_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 6 C72 2 96 22 92 48 C98 70 76 96 52 92 C30 98 6 80 10 56 C2 34 24 8 50 6Z" fill="#fffdf2" stroke="#d9a34a" stroke-width="3"/>
  <circle cx="50" cy="50" r="19" fill="#ffb81f" stroke="#e08a00" stroke-width="2.5"/>
  <circle cx="43" cy="43" r="5" fill="#fff0a8"/>
  </svg>`,
  { size: 128 },
);
const POCKET_TEX = svg(
  `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 4 H94 V52 Q94 66 80 66 H20 Q6 66 6 52Z" fill="#fff8e6" stroke="#d9382f" stroke-width="4" stroke-dasharray="7 3.5"/>
  <text x="50" y="30" font-size="19" font-family="serif" font-weight="bold" text-anchor="middle" fill="#d9382f">Chef</text>
  <text x="50" y="52" font-size="15" font-family="serif" font-style="italic" text-anchor="middle" fill="#2a4f7a">Octavio</text>
  </svg>`,
  { size: 256 },
);
const BLUSH_TEX = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="30" rx="46" ry="26" fill="#ff9a8a"/>
  <circle cx="34" cy="26" r="2.8" fill="#d9503f"/><circle cx="50" cy="34" r="2.8" fill="#d9503f"/>
  <circle cx="64" cy="25" r="2.8" fill="#d9503f"/><circle cx="46" cy="22" r="2.2" fill="#d9503f"/>
  </svg>`,
  { size: 128 },
);
const FLAME_TEX = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 94 C6 84 4 56 20 40 C20 54 28 58 30 50 C28 34 36 18 36 2 C52 26 62 48 58 68 C56 84 46 92 32 94Z" fill="#ff6a1a"/>
  <path d="M32 92 C14 84 14 62 24 50 C26 60 30 62 32 56 C32 44 38 36 40 24 C50 42 54 58 50 72 C48 84 42 90 32 92Z" fill="#ffae2e"/>
  <path d="M32 90 C22 84 22 70 29 62 C31 68 34 68 35 62 C38 68 42 76 40 82 C38 88 36 90 32 90Z" fill="#fff3a6"/>
  </svg>`,
  { size: 128 },
);
const STAR_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 3 L38 26 L61 32 L38 38 L32 61 L26 38 L3 32 L26 26Z" fill="#fff2a8" stroke="#ffd23f" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 64 },
);

export default function build() {
  const b = createBuilder({ name: "octopus_chef" });
  const R = rng(11);
  type Chain = ReturnType<typeof b.chain>;
  type Sweep = ReturnType<typeof b.sweep>;
  type JointT = ReturnType<typeof b.joint>;

  const perp = (a: THREE.Vector3, n: THREE.Vector3) => a.clone().addScaledVector(n, -a.dot(n)).normalize();
  const circle = (c: THREE.Vector3, axis: THREE.Vector3, r: number, n = 20) => {
    const q = aim(axis);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(V(Math.cos(a) * r, 0, Math.sin(a) * r).applyQuaternion(q).add(c));
    }
    return catmull(pts, { closed: true });
  };
  const ball = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

  // ================= skeleton =================
  const hips = b.joint("hips", { at: [0, 0.4, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, 0.03],
      [0, 0.66, 0.02],
      [0, 1.0, -0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.74, 0], dir: [0, 1, -0.05], role: "head" });

  // ================= mantle =================
  const bulb = b.sweep(spine, [0.21, 0.33, 0.39, 0.4, 0.35, 0.24, 0.1], {
    color: COAT,
    sides: 14,
    caps: "round",
    name: "mantle",
  });
  const skin = b.surface(bulb);
  const C0 = V(0, 0.74, 0);
  const hit = (az: number, el: number) => {
    const h = skin.around(C0).at(az, el);
    if (!h) throw new Error(`no face hit at ${az},${el}`);
    return h;
  };
  const fp = (az: number, el: number, lift = 0) => {
    const h = hit(az, el);
    return h.at.clone().addScaledVector(h.n, lift);
  };

  // ================= face: eyes =================
  for (const s of [1, -1]) {
    const h = hit(s * 27, 5);
    const eyeC = h.at.clone().addScaledVector(h.n, 0.03);
    const eye = b.part(ball(0.104, 16, 12), EYEWHITE, { bone: head, at: eyeC, name: `eyeball${s > 0 ? "L" : "R"}` });
    const gaze = h.n.clone().multiplyScalar(0.5).add(V(0, 0, 0.5)).normalize();
    b.decal(eye, EYE_TEX, {
      at: eyeC.clone().addScaledVector(gaze, 0.105),
      dir: gaze,
      up: [0, 1, 0],
      size: [0.16, 0.16],
      segments: 14,
      mirror: s < 0,
      bone: head,
    });
    // upper lid: a cap whose edge cuts across the eye
    const pole = UP.clone().multiplyScalar(0.8).addScaledVector(gaze, -0.6).normalize();
    b.part(new THREE.SphereGeometry(0.11, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), COAT, {
      bone: head,
      at: eyeC,
      dir: pole,
      name: "lid",
    });
    b.sweep(circle(eyeC, pole, 0.11, 18), 0.006, { color: "#b83a30", bone: head, sides: 5, name: "lidRim" });
    // brow
    const brow = [hit(s * 14, 28), hit(s * 27, 33), hit(s * 40, 27)].map((q) => q.at.clone().addScaledVector(q.n, 0.014));
    b.sweep(catmull(brow), [0.02, 0.024, 0.014], { color: DARK, bone: head, sides: 6, name: "brow" });
    // cheeks
    const ch = hit(s * 44, -8);
    b.decal(bulb, BLUSH_TEX, { at: ch.at, dir: ch.n, up: [0, 1, 0], size: [0.13, 0.08], segments: 8 });
  }

  // ================= face: mouth with separate jaws =================
  const jaw = b.joint("jaw", { parent: head, at: fp(0, -24, -0.03), dir: [0, 0, 1], role: "jaw" });
  const smile = (base: number, curv: number, lift: number) =>
    catmull([-24, -12, 0, 12, 24].map((az) => fp(az, base + curv * Math.pow(az / 24, 2), lift)));
  const bump = (k: number, h: number) => (t: number) => k + h * Math.pow(Math.sin(Math.PI * t), 0.6);
  // interior, upper lip (head); lower lip, tongue (jaw)
  b.sweep(smile(-26, 10, 0.004), (t) => [0.012, bump(0.006, 0.05)(t)], { color: "#5a1620", bone: head, sides: 6, name: "mouthIn" });
  b.sweep(smile(-21, 10, 0.012), (t) => [0.016, bump(0.012, 0.004)(t)], { color: LIP, bone: head, sides: 6, name: "upperLip" });
  b.sweep(smile(-33, 14, 0.012), (t) => [0.018, bump(0.012, 0.018)(t)], { color: LIP, bone: jaw, sides: 6, name: "lowerLip" });
  b.sweep(smile(-29, 12, 0.008), (t) => [0.012, bump(0.003, 0.016)(t)], { color: "#ff8fa6", bone: jaw, sides: 6, name: "tongue" });
  // smile creases
  for (const s of [1, -1]) {
    const c0 = fp(s * 27, -14, 0.01);
    b.sweep(catmull([c0, c0.clone().add(V(s * 0.02, 0.02, 0.0)), c0.clone().add(V(s * 0.025, 0.045, 0.0))]), [0.009, 0.004], {
      color: "#b83a30",
      bone: head,
      sides: 5,
      name: "crease",
    });
  }

  // ================= mustache =================
  for (const s of [1, -1]) {
    const base = [0, 7, 14, 21].map((az) => fp(s * az, -11 + Math.pow(az / 21, 2) * 2, 0.026));
    const last = base[3];
    const tail = [
      last.clone().add(V(s * 0.04, -0.012, 0.012)),
      last.clone().add(V(s * 0.075, 0.0, 0.016)),
      last.clone().add(V(s * 0.09, 0.04, 0.016)),
      last.clone().add(V(s * 0.062, 0.058, 0.014)),
    ];
    b.sweep(catmull([...base, ...tail]), [0.036, 0.008], { color: DARK, bone: head, sides: 7, name: "mustache" });
  }

  // ================= chef's toque =================
  const top = skin.ray([0, 3, -0.04], [0, -1, 0]);
  const hatP = (top ? top.at.clone() : V(0, 1.1, -0.04)).add(V(0, -0.17, -0.02));
  const hatAxis = V(0.06, 1, -0.14).normalize();
  const hatQ = aim(hatAxis);
  const hl = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(hatQ).add(hatP);
  b.lathe(
    [[0, 0], [0.215, 0], [0.225, 0.012], [0.225, 0.17], [0, 0.17]] as Pt[],
    { at: hatP, axis: hatAxis, segments: 14, color: HATP, bone: head, name: "hatBand" },
  );
  b.lathe(
    [[0, 0.16], [0.22, 0.16], [0.26, 0.22], [0.31, 0.3], [0.33, 0.38], [0.3, 0.46], [0.22, 0.52], [0.1, 0.545], [0, 0.55]] as Pt[],
    { at: hatP, axis: hatAxis, segments: 10, color: HATP, bone: head, name: "hatCrown" },
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    b.part(ball(0.1, 8, 6), HATP, { bone: head, at: hl(Math.cos(a) * 0.2, 0.5, Math.sin(a) * 0.2), scale: [1, 0.85, 1], name: "hatPuff" });
  }
  b.part(ball(0.14, 9, 6), HATP, { bone: head, at: hl(0, 0.57, 0), scale: [1, 0.8, 1], name: "hatTop" });
  b.sweep(circle(hl(0, 0.045, 0), hatAxis, 0.228, 22), 0.013, { color: RED, bone: head, sides: 6, name: "hatRibbon" });

  // ================= apron skirt =================
  const skirt = b.lathe(
    [[0.25, 0.46], [0.32, 0.46], [0.405, 0.235], [0.37, 0.235]] as Pt[],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 16, color: APRON, bone: hips, name: "apron" },
  );
  b.sweep(circle(V(0, 0.262, 0), UP, 0.399, 24), 0.011, { color: RED, bone: hips, sides: 6, name: "apronHem" });
  b.sweep(circle(V(0, 0.456, 0), UP, 0.326, 24), 0.02, { color: RED, bone: hips, sides: 8, name: "waistBand" });
  const pk = b.surface(skirt).ray([0, 0.34, 2], [0, 0, -1]);
  if (pk) b.decal(skirt, POCKET_TEX, { at: pk.at, dir: pk.n, up: [0, 1, 0], size: [0.2, 0.14], segments: 8 });
  // bow at the back
  b.part(ball(0.03, 8, 6), RED, { bone: hips, at: [0, 0.456, -0.345], name: "bowKnot" });
  for (const s of [1, -1]) {
    b.part(ball(0.045, 8, 6), RED, { bone: hips, at: [s * 0.07, 0.462, -0.35], scale: [1.5, 1, 0.55], name: "bowLoop" });
    b.rod([s * 0.02, 0.45, -0.345], [s * 0.06, 0.3, -0.385], [0.016, 0.012], { color: RED, bone: hips, name: "bowTail" });
  }

  // ================= arms =================
  const armHub = (az: number, r: number, y: number, l = 0) =>
    V(Math.sin(az) * r + Math.cos(az) * l, y, Math.cos(az) * r - Math.sin(az) * l);
  type Arm = { chain: Chain; sweep: Sweep; rad: (t: number) => number };
  const tipOf = (a: Arm): JointT => a.chain.joints[a.chain.joints.length - 1];
  const makeArm = (name: string, pts: THREE.Vector3[], base: number, tip: number, count: number): Arm => {
    const rad = (t: number) => tip + (base - tip) * Math.pow(1 - t, 1.15);
    const chain = b.chain(name, catmull(pts), { parent: hips, count, role: "tentacle" });
    const sweep = b.sweep(chain, rad, { color: COAT, name: `${name}Skin` });
    return { chain, sweep, rad };
  };
  const suckers = (a: Arm, n: number, t0: number, t1: number, angles: number[]) => {
    angles.forEach((ang, row) => {
      for (let i = 0; i < n; i++) {
        const t = t0 + ((t1 - t0) * (i + (row ? 0.5 : 0))) / n;
        const p = a.sweep.at(t, ang);
        const r = a.rad(t);
        b.stick(new THREE.CylinderGeometry(r * 0.5, r * 0.6, r * 0.3, 8), SUCKER, p, { embed: 0.5, name: "sucker" });
      }
    });
  };
  const cuff = (a: Arm, t0: number, t1: number) => {
    b.sweep(a.chain, (t: number) => a.rad(t) + 0.014, { from: t0, to: t1, color: WHITE, caps: "flat", sides: 10, name: "cuff" });
    b.sweep(a.chain, (t: number) => a.rad(t) + 0.019, { from: t0, to: t0 + 0.02, color: RED, caps: "flat", sides: 10, name: "cuffTrim" });
  };
  const wrap = (a: Arm, c: THREE.Vector3, axis: THREE.Vector3, from: THREE.Vector3, turns: number, pitch: number) => {
    const tr = a.rad(1);
    b.sweep(spiral(c, from, axis, { turns, r1: 0.03, pitch }), [tr * 1.05, tr * 0.55], {
      color: COAT,
      bone: tipOf(a),
      sides: 6,
      name: "wrap",
    });
  };

  // ---- floor arms holding tools (E spatula, F ladle) ----
  const floorTool = (name: string, s: number) => {
    const az = (s * 24 * Math.PI) / 180;
    const pts = [
      armHub(az, 0.14, 0.42),
      armHub(az, 0.3, 0.2, s * 0.02),
      armHub(az, 0.52, 0.07, s * 0.06),
      armHub(az, 0.72, 0.045, -s * 0.03),
      armHub(az, 0.865, 0.17),
    ];
    const a = makeArm(name, pts, 0.085, 0.016, 6);
    const c = armHub(az, 0.9, 0.17);
    wrap(a, c, UP, pts[4], 1.6, 0.04);
    suckers(a, 8, 0.2, 0.9, [120, 240]);
    return { a, x: armHub(az, 0.9, 0).x, z: armHub(az, 0.9, 0).z };
  };
  const E = floorTool("armE", 1);
  const F = floorTool("armF", -1);
  // spatula
  b.rod([E.x, 0, E.z], [E.x, 0.58, E.z], [0.018, 0.014], WOOD, { bone: tipOf(E.a), name: "spatulaHandle" });
  b.part(ball(0.02, 8, 6), WOOD_D, { bone: tipOf(E.a), at: [E.x, 0.012, E.z], name: "spatulaKnob" });
  b.extrude(
    [[-0.045, 0], [0.045, 0], [0.058, 0.12], [0.04, 0.15], [-0.04, 0.15], [-0.058, 0.12]] as Pt[],
    { at: [E.x, 0.56, E.z], x: [1, 0, 0], thickness: 0.008, bevel: 0.002, color: STEEL, bone: tipOf(E.a), name: "spatulaHead" },
  );
  for (const sx of [-0.022, 0, 0.022])
    b.rod([E.x + sx, 0.62, E.z + 0.006], [E.x + sx, 0.69, E.z + 0.006], 0.004, { color: "#59627a", bone: tipOf(E.a), name: "slot" });
  // ladle
  b.rod([F.x, 0, F.z], [F.x, 0.52, F.z], [0.018, 0.014], WOOD, { bone: tipOf(F.a), name: "ladleHandle" });
  b.part(ball(0.02, 8, 6), WOOD_D, { bone: tipOf(F.a), at: [F.x, 0.012, F.z], name: "ladleKnob" });
  b.rod([F.x, 0.5, F.z], [F.x + 0.03, 0.6, F.z], 0.012, STEEL_C, { bone: tipOf(F.a), name: "ladleNeck" });
  b.lathe(
    [[0, 0], [0.03, 0.005], [0.055, 0.03], [0.068, 0.075], [0.06, 0.075], [0.05, 0.038], [0.028, 0.014], [0, 0.011]] as Pt[],
    { at: [F.x + 0.035, 0.59, F.z], axis: [0.12, 1, 0], segments: 12, color: STEEL, bone: tipOf(F.a), name: "ladleBowl" },
  );

  // ---- back floor arms, curling out to the sides ----
  for (const s of [1, -1]) {
    const az = (s * 148 * Math.PI) / 180;
    const L: [number, number, number][] = [
      [0.14, 0.42, 0], [0.3, 0.22, 0], [0.55, 0.08, 0.1], [0.85, 0.05, -0.08], [1.12, 0.04, 0.12],
      [1.38, 0.035, -0.02], [1.55, 0.05, -0.18], [1.6, 0.1, -0.3], [1.5, 0.16, -0.38], [1.4, 0.17, -0.31],
    ];
    const a = makeArm(s > 0 ? "armG" : "armH", L.map(([r, y, l]) => armHub(az, r, y, l * s)), 0.09, 0.012, 8);
    suckers(a, 11, 0.25, 0.97, [125, 235]);
  }

  // ---- raised arms holding pans (A left, B right) ----
  const FRY: Pt[] = [[0, 0], [0.12, 0], [0.165, 0.035], [0.178, 0.04], [0.178, 0.046], [0.163, 0.046], [0.118, 0.012], [0, 0.012]];
  const SAUCE: Pt[] = [[0, 0], [0.11, 0], [0.12, 0.01], [0.12, 0.12], [0.108, 0.12], [0.108, 0.015], [0, 0.015]];
  const buildPan = (o: { center: THREE.Vector3; U: THREE.Vector3; D: THREE.Vector3; kind: "fry" | "sauce"; bone: JointT; body: any; name: string }) => {
    const fry = o.kind === "fry";
    const Rr = fry ? 0.17 : 0.12;
    const Lh = fry ? 0.28 : 0.22;
    b.lathe(fry ? FRY : SAUCE, { at: o.center, axis: o.U, segments: 14, color: o.body, bone: o.bone, name: `${o.name}Body` });
    b.part(new THREE.CircleGeometry(Rr * 0.76, 16), "#26262c", {
      bone: o.bone,
      at: o.center.clone().addScaledVector(o.U, fry ? 0.0135 : 0.016),
      dir: o.U,
      axis: "z",
      name: `${o.name}Floor`,
    });
    const rim = o.center.clone().addScaledVector(o.D, -(Rr - 0.01));
    const end = rim.clone().addScaledVector(o.D, -Lh);
    b.rod(end, rim, [0.016, 0.021], WOOD_D, { bone: o.bone, name: `${o.name}Handle` });
    b.part(ball(0.021, 8, 6), WOOD, { bone: o.bone, at: end, name: `${o.name}Cap` });
    for (const k of [0.04, 0.085]) {
      b.part(ball(0.012, 6, 4), STEEL_C, {
        bone: o.bone,
        at: rim.clone().addScaledVector(o.D, -k).addScaledVector(o.U, 0.017),
        name: `${o.name}Rivet`,
      });
    }
    b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.03, 8), STEEL_C, {
      bone: o.bone,
      at: rim.clone().addScaledVector(o.D, 0.005),
      dir: o.D,
      name: `${o.name}Ferrule`,
    });
  };

  const holder = (name: string, s: number, G: THREE.Vector3, Dh: THREE.Vector3, pts: THREE.Vector3[], kind: "fry" | "sauce") => {
    const D = Dh.clone().normalize();
    const U = perp(UP, D);
    const p = perp(UP.clone().negate(), D);
    const from = G.clone().addScaledVector(p, 0.036);
    const a = makeArm(name, [...pts, from], 0.08, 0.016, 7);
    wrap(a, G, D, from, 1.5, 0.03);
    suckers(a, 9, 0.2, 0.8, [150, 210]);
    cuff(a, 0.8, 0.88);
    const Lh = kind === "fry" ? 0.28 : 0.22;
    const Rr = kind === "fry" ? 0.17 : 0.12;
    const center = G.clone().addScaledVector(D, -0.1 + Lh + Rr - 0.01);
    buildPan({ center, U, D, kind, bone: tipOf(a), body: kind === "fry" ? COPPER : STEEL, name: kind === "fry" ? "panA" : "panB" });
    return { a, center, U, D, s };
  };

  const PA = holder(
    "armA",
    1,
    V(0.62, 1.38, 0.4),
    V(0.7, 0.12, 0.7),
    [V(0.14, 0.42, 0.08), V(0.36, 0.34, 0.3), V(0.56, 0.55, 0.48), V(0.7, 0.92, 0.52), V(0.72, 1.2, 0.46)],
    "fry",
  );
  // fried egg
  b.part(new THREE.CircleGeometry(0.09, 18), "#ffffff", {
    bone: tipOf(PA.a),
    at: PA.center.clone().addScaledVector(PA.U, 0.0175),
    dir: PA.U,
    axis: "z",
    texture: EGG_TEX,
    name: "friedEgg",
  });
  const PB = holder(
    "armB",
    -1,
    V(-0.6, 1.32, 0.4),
    V(-0.7, 0.1, 0.7),
    [V(-0.14, 0.42, 0.08), V(-0.36, 0.34, 0.3), V(-0.56, 0.52, 0.48), V(-0.7, 0.88, 0.52), V(-0.7, 1.14, 0.46)],
    "sauce",
  );
  // veggies bouncing out of the saucepan
  const bB = tipOf(PB.a);
  for (let i = 0; i < 6; i++) {
    const o = PB.center.clone().add(V((R() - 0.5) * 0.2, 0.2 + R() * 0.24, (R() - 0.5) * 0.2));
    b.part(ball(0.02, 7, 5), i % 2 ? "#6cc04a" : "#4fa83a", { bone: bB, at: o, name: "pea" });
  }
  for (let i = 0; i < 3; i++) {
    const o = PB.center.clone().add(V((R() - 0.5) * 0.24, 0.26 + R() * 0.2, (R() - 0.5) * 0.24));
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 10), "#f28a1e", { bone: bB, at: o, rotation: [R() * 90, 0, R() * 90], name: "carrot" });
  }
  const tom = PB.center.clone().add(V(0.02, 0.32, 0.03));
  b.part(ball(0.04, 9, 7), "#e23b2e", { bone: bB, at: tom, name: "tomato" });
  b.part(new THREE.ConeGeometry(0.022, 0.016, 5), "#3f9a35", { bone: bB, at: tom.clone().add(V(0, 0.038, 0)), name: "tomatoLeaf" });

  // ---- raised arms reaching for the airborne pans (C left, D right) ----
  const reach: [number, number, number][] = [
    [0.17, 0.4, 0.02], [0.45, 0.33, 0.03], [0.74, 0.5, 0.05], [0.93, 0.88, 0.1], [0.98, 1.28, 0.15],
    [0.9, 1.62, 0.2], [0.78, 1.82, 0.22], [0.66, 1.88, 0.2], [0.57, 1.8, 0.18],
  ];
  for (const s of [1, -1]) {
    const a = makeArm(s > 0 ? "armC" : "armD", reach.map(([x, y, z]) => V(s * x, y, z)), 0.075, 0.012, 8);
    suckers(a, 11, 0.2, 0.95, [150, 210]);
    cuff(a, 0.55, 0.63);
  }

  // ================= airborne props =================
  const flyJoint = (name: string, at: THREE.Vector3) => b.joint(name, { parent: hips, at, group: "props" });
  // flambé pan (left)
  {
    const center = V(0.62, 2.04, 0.12);
    const U = V(0.3, 1, 0.15).normalize();
    const D = perp(V(0.6, 0.3, -0.5), U);
    const j = flyJoint("panFlyL", center);
    buildPan({ center, U, D, kind: "fry", bone: j, body: IRON, name: "panFlame" });
    const base = center.clone().addScaledVector(U, 0.05);
    const defs: [number, number, number, number, number][] = [
      [0, 0, 0.26, 0.36, 0], [0.07, 0.03, 0.18, 0.26, 0.04], [-0.07, -0.02, 0.2, 0.28, -0.04],
    ];
    for (const [dx, dz, w, h] of defs) {
      const at = base.clone().add(V(dx, 0, dz));
      glow(b.cards([frame(at, U.clone())], FLAME_TEX, { size: [w, h], cross: true, bone: j, flow: [0, 0, 1], sink: 0.02 }), 1.4);
    }
  }
  // pancake pan (right)
  {
    const center = V(-0.66, 2.08, 0.22);
    const U = V(-0.35, 1, 0.1).normalize();
    const D = perp(V(-0.6, 0.2, 0.7), U);
    const j = flyJoint("panFlyR", center);
    buildPan({ center, U, D, kind: "fry", bone: j, body: COPPER, name: "panFlip" });
    const jp = flyJoint("pancake", center.clone().addScaledVector(U, 0.42));
    const pc = center.clone().addScaledVector(U, 0.42).add(V(0.04, 0.02, 0));
    const ax = V(0.5, 1, 0.3).normalize();
    b.lathe([[0, 0], [0.1, 0], [0.108, 0.01], [0.1, 0.02], [0, 0.022]] as Pt[], {
      at: pc,
      axis: ax,
      segments: 14,
      color: PANCAKE,
      bone: jp,
      name: "pancake",
    });
    b.part(new THREE.BoxGeometry(0.035, 0.012, 0.035), "#ffe58a", {
      bone: jp,
      at: pc.clone().addScaledVector(ax, 0.027),
      dir: ax,
      name: "butter",
    });
  }
  // spinning lid
  {
    const center = V(0.02, 2.26, -0.04);
    const ax = V(0.25, 1, 0.3).normalize();
    const j = flyJoint("lid", center);
    b.lathe(
      [[0, 0], [0.125, 0], [0.125, 0.01], [0.1, 0.013], [0.07, 0.04], [0.016, 0.06], [0.016, 0.068], [0, 0.068]] as Pt[],
      { at: center, axis: ax, segments: 14, color: STEEL, bone: j, name: "lid" },
    );
    b.part(ball(0.024, 8, 6), WOOD_D, { bone: j, at: center.clone().addScaledVector(ax, 0.085), name: "lidKnob" });
  }

  // sparkles around the juggling
  const stars: [number, number, number, number][] = [
    [0.2, 2.45, 0.1, 0.12], [-0.4, 2.4, 0.15, 0.09], [1.0, 2.2, 0.0, 0.1],
    [-1.05, 2.3, 0.2, 0.11], [0.45, 1.9, 0.4, 0.07], [-0.3, 1.85, 0.45, 0.07], [0.0, 2.02, 0.2, 0.06],
  ];
  for (const [x, y, z, sz] of stars) {
    glow(b.cards([frame(V(x, y, z), [0, 1, 0])], STAR_TEX, { size: sz * 2, bone: hips, flow: [0, 0, 1], sink: 0 }), 1.3);
  }

  // jaw open a touch for a grin
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });
  return b.root;
}
```