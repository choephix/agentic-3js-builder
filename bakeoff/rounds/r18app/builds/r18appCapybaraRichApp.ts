import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import type { Joint } from "../../../../src/skeleton";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Capybara with Songbird",
  description:
    "A chubby, sleepy-eyed storybook capybara with buck teeth and rosy cheeks, calmly carrying a little singing bluebird on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

// Palette
const FUR_MID = "#b27442";
const FUR_LIGHT = "#d29a5c";
const FUR_DARK = "#8d5530";
const TAN = "#e6bd84";
const TAN_LIGHT = "#f2d8a6";
const LEG_DARK = "#6a4129";
const PAW = "#4f3022";
const NAIL = "#2b1a12";
const NOSE = "#3d251d";
const EAR_OUT = "#7b4a2c";
const EAR_IN = "#e7a08f";
const TEETH = "#ffb23c";
const WHISKER = "#4a2e20";
const MOUTH = "#4a2a1e";
const BLUE = "#3f94e8";
const NAVY = "#1f4fa8";
const BREAST = "#ff8e3c";
const CREAM = "#fff3d6";
const BEAK = "#f6b21c";
const BIRD_LEG = "#d98a3a";
const BLACK = "#1c120d";
const PETAL = "#fffaf0";
const CENTER = "#ffcb2e";

// Paints
const FUR = grain(FUR_MID, FUR_LIGHT, { size: 0.012, axis: "z", seed: 2 });
const BACK = mottle(FUR, FUR_DARK, { size: 0.2, contrast: 0.55, seed: 4 });
const BELLY = grain(TAN, TAN_LIGHT, { size: 0.012, axis: "z", seed: 6 });
const COAT = countershade(BACK, BELLY, { level: -0.35, soft: 0.3 });
const HEAD_COAT = countershade(
  gradient(BACK, gradient(FUR_LIGHT, TAN, [0, 0.5, 0.5], [0, 0.4, 0.7]), [0, 0, 0.5], [0, 0, 0.68]),
  BELLY,
  { level: -0.4, soft: 0.3 },
);
const LEG_COAT = gradient(COAT, LEG_DARK, [0, 0.21, 0], [0, 0.07, 0]);
const JAW_COAT = countershade(gradient(FUR_LIGHT, TAN, [0, 0, 0.5], [0, 0, 0.68]), BELLY, { level: -0.3 });

const TUFT = svg(
  `<svg viewBox="0 0 48 72">
    <path d="M24 0 L31 44 L24 72 L17 44 Z" fill="#ffffff"/>
    <path d="M8 14 L20 52 L15 72 L5 44 Z" fill="#e6e6e6"/>
    <path d="M40 14 L43 44 L33 72 L28 52 Z" fill="#d6d6d6"/>
  </svg>`,
  { size: 96 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 64">
    <path d="M4 27 Q32 16 60 27 C61 48 48 60 32 60 C16 60 3 48 4 27 Z" fill="#2a160f"/>
    <circle cx="23" cy="38" r="8.5" fill="#ffffff"/>
    <circle cx="42" cy="49" r="4" fill="#ffffff"/>
    <circle cx="44" cy="37" r="2.4" fill="#ffffff"/>
    <path d="M2 28 Q32 14 62 28" stroke="#1a0c07" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path d="M6 28 Q-2 24 -3 16" stroke="#1a0c07" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M14 14 Q32 4 52 14" stroke="#7a4a2a" stroke-width="5" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

const BLUSH = svg(
  `<svg viewBox="0 0 60 40">
    <ellipse cx="30" cy="20" rx="27" ry="16" fill="#f2907c"/>
    <path d="M14 14 l6 14 M27 12 l6 16 M40 14 l6 14" stroke="#e0705e" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const R = rng(5);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ell = (c: THREE.Vector3 | number[], r: number[], color: string | ReturnType<typeof paint>, bone: Joint, segs: [number, number] = [10, 7]) =>
    b.part(new THREE.SphereGeometry(1, segs[0], segs[1]), color, { at: c, scale: r, bone });

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.37, -0.34], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.37, -0.34],
      [0, 0.365, -0.1],
      [0, 0.36, 0.12],
      [0, 0.37, 0.32],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.37, 0.32],
      [0, 0.4, 0.36],
      [0, 0.43, 0.4],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.43, 0.4], aim: [0, 0.405, 0.7], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.34, 0.5], aim: [0, 0.32, 0.7], role: "jaw" });
  const tail = b.joint("tail1", { parent: hips, at: [0, 0.34, -0.58], dir: [0, -0.2, -1], role: "tail" });

  // ------------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 0.33, -0.62], w: 0.2, h: 0.22 },
      { at: [0, 0.34, -0.53], w: 0.36, h: 0.38 },
      { at: [0, 0.35, -0.38], w: 0.45, h: 0.46 },
      { at: [0, 0.35, -0.12], w: 0.46, h: 0.46 },
      { at: [0, 0.35, 0.1], w: 0.45, h: 0.45 },
      { at: [0, 0.36, 0.28], w: 0.39, h: 0.42 },
      { at: [0, 0.37, 0.4], w: 0.3, h: 0.36 },
    ],
    { bone: [hips, spine, neck], color: COAT, name: "body" },
  );

  // ------------------------------------------------------------------ head
  const skull = b.loft(
    [
      { at: [0, 0.45, 0.28], w: 0.3, h: 0.31 },
      { at: [0, 0.455, 0.4], w: 0.32, h: 0.32 },
      { at: [0, 0.45, 0.52], w: 0.3, h: 0.29 },
      { at: [0, 0.445, 0.62], w: 0.27, h: 0.26 },
      { at: [0, 0.44, 0.69], w: 0.24, h: 0.23 },
    ],
    { bone: head, color: HEAD_COAT, name: "skull" },
  );
  const chin = b.loft(
    [
      { at: [0, 0.31, 0.46], w: 0.2, h: 0.07 },
      { at: [0, 0.31, 0.58], w: 0.19, h: 0.07 },
      { at: [0, 0.315, 0.67], w: 0.14, h: 0.065 },
    ],
    { bone: jaw, color: JAW_COAT, name: "chin" },
  );
  void chin;

  // nose pad, nostrils, snout bump, buck teeth
  ell([0, 0.44, 0.745], [0.095, 0.062, 0.05], NOSE, head);
  for (const s of [1, -1]) {
    ell([s * 0.032, 0.462, 0.775], [0.016, 0.007, 0.012], BLACK, head, [6, 4]);
    ell([s * 0.035, 0.452, 0.79], [0.01, 0.005, 0.005], "#6d4638", head, [5, 3]);
  }
  ell([0, 0.568, 0.6], [0.045, 0.014, 0.06], "#5a382b", head);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.026, 0.05, 0.016), TEETH, { at: [s * 0.0145, 0.372, 0.758], bone: head });
    b.part(new THREE.BoxGeometry(0.026, 0.012, 0.018), "#ffd27a", { at: [s * 0.0145, 0.395, 0.758], bone: head });
  }

  // eyes, blush
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.nearest(V(s * 0.13, 0.5, 0.5));
    b.decal(skin, EYE, { at: eyeHit, size: [0.085, 0.085], mirror: s > 0, up: [0, 1, 0], name: `eye${s > 0 ? "L" : "R"}` });
    const cheek = skin.nearest(V(s * 0.15, 0.4, 0.52));
    b.decal(skin, BLUSH, { at: cheek, size: [0.07, 0.047], mirror: s > 0, name: `blush${s > 0 ? "L" : "R"}` });
  }

  // smile line and chin crease
  for (const s of [1, -1]) {
    const corner = skin.nearest(V(s * 0.14, 0.345, 0.5));
    const mid = skin.nearest(V(s * 0.12, 0.328, 0.6));
    const front = skin.nearest(V(s * 0.06, 0.33, 0.7));
    b.sweep(catmull([corner.moved([0, 0.003, 0]), mid.moved([0, 0.003, 0]), front.moved([0, 0.003, 0])]), [0.004, 0.003], {
      color: MOUTH,
      bone: head,
      sides: 5,
    });
  }

  // whiskers
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++) {
      const y = 0.42 - k * 0.012;
      const start = V(s * 0.1, y, 0.7);
      const end = V(s * (0.27 + 0.02 * (k % 2)), 0.4 + (k - 1.5) * 0.028, 0.79);
      const ctrl = V(s * 0.19, y + 0.02, 0.77);
      b.sweep(bezier(start, ctrl, end), [0.0035, 0.001], { color: WHISKER, bone: head, sides: 4, caps: { end: "point" } });
    }

  // ears with a tuft of inner pink
  const earOutline: [number, number][] = [
    [-0.038, 0],
    [-0.044, 0.032],
    [-0.022, 0.064],
    [0.022, 0.064],
    [0.044, 0.032],
    [0.038, 0],
  ];
  for (const s of [1, -1]) {
    const earBase = V(s * 0.118, 0.575, 0.355);
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, { parent: head, at: earBase, dir: [s * 0.45, 1, -0.1], role: "hinge" });
    const a = 18 * DEG;
    const x: [number, number, number] = [Math.cos(a), -s * Math.sin(a), 0];
    const y: [number, number, number] = [s * Math.sin(a), Math.cos(a), 0];
    const thick = new THREE.Vector3(...x).cross(new THREE.Vector3(...y)).normalize();
    const earPaint = paint((_p, n, c) => {
      const inner = ((c[0] / 0.026) ** 2 + ((c[1] - 0.032) / 0.03) ** 2 < 1) && n.dot(thick) > 0.6;
      return inner ? EAR_IN : Math.abs(n.dot(thick)) < 0.5 ? FUR_LIGHT : EAR_OUT;
    });
    b.extrude(earOutline, { at: earBase, x, y, thickness: 0.022, bevel: 0.007, smoothing: 2, color: earPaint, bone: ear, name: `ear${side}` });
  }

  // ------------------------------------------------------------------ legs
  const addToes = (
    chain: ReturnType<typeof b.chain>,
    foot: THREE.Vector3,
    s: number,
    count: number,
    tag: string,
  ) => {
    const tip = chain.tip!;
    ell([foot.x, 0.03, foot.z + 0.025], [0.052, 0.032, 0.06], PAW, tip);
    for (let i = 0; i < count; i++) {
      const f = i - (count - 1) / 2;
      const base = V(foot.x + f * 0.028, 0.03, foot.z + 0.05);
      const end = V(foot.x + f * 0.05, 0.02, foot.z + 0.12 - Math.abs(f) * 0.012);
      const toe = b.joint(`toe${i + 1}${tag}`, { parent: tip, at: base, aim: end, role: "digit" });
      b.capsule(base, end, [0.017, 0.014], PAW, { bone: toe, sides: 6 });
      b.spike(end, [f * 0.25, -0.15, 1], 0.02, 0.012, { color: NAIL, bone: toe, sides: 5 });
    }
    void s;
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const shoulder = V(s * 0.17, 0.29, 0.2);
    const wrist = V(s * 0.16, 0.04, 0.23);
    const fl = b.chain(`legF${S}`, limb(shoulder, wrist, [0.15, 0.14], [[0, 0, -1]]), {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "leg",
      contact: [wrist.x, 0, wrist.z + 0.07],
    });
    b.sweep(fl, [0.075, 0.062, 0.046], { color: LEG_COAT, sides: 8, name: `legF${S}` });
    ell([s * 0.17, 0.3, 0.2], [0.085, 0.1, 0.1], COAT, fl.joints[0]);
    addToes(fl, wrist, s, 4, `F${S}`);

    // hind
    const hipP = V(s * 0.2, 0.29, -0.38);
    const ankle = V(s * 0.18, 0.04, -0.4);
    const hl = b.chain(
      `legH${S}`,
      limb(hipP, ankle, [0.16, 0.14, 0.1], [[0, 0, 1], [0, 0, -1]]),
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `hock${S}`, `footH${S}`],
        role: "leg",
        contact: [ankle.x, 0, ankle.z + 0.07],
      },
    );
    b.sweep(hl, [0.1, 0.075, 0.052, 0.044, 0.044], { color: LEG_COAT, sides: 8, name: `legH${S}` });
    ell([s * 0.2, 0.31, -0.4], [0.1, 0.13, 0.15], COAT, hl.joints[0]);
    addToes(hl, ankle, s, 3, `H${S}`);
  }

  // tail stub
  ell([0, 0.335, -0.635], [0.03, 0.03, 0.035], FUR_DARK, tail);

  // ------------------------------------------------------------------ fur tufts
  const bodySkin = b.surface(body);
  const tuftHits = bodySkin.scatter(320, {
    rng: rng(11),
    minDist: 0.052,
    filter: (h) => h.at.z < 0.3 && h.n.y > -0.45,
  });
  b.cards(tuftHits, TUFT, {
    size: [0.05, 0.075],
    lean: 62,
    bend: 25,
    cross: true,
    vary: 0.3,
    spin: 12,
    rng: R,
    color: COAT,
    sink: 0.25,
  });
  const cheekHits = skin.scatter(70, {
    rng: rng(13),
    minDist: 0.04,
    filter: (h) => h.at.z < 0.5 && h.at.z > 0.3 && Math.abs(h.n.x) > 0.5 && h.at.y < 0.5,
  });
  b.cards(cheekHits, TUFT, {
    size: [0.04, 0.055],
    lean: 70,
    bend: 20,
    cross: true,
    vary: 0.25,
    rng: R,
    color: HEAD_COAT,
    flow: [0, -0.1, -1],
  });

  // ------------------------------------------------------------------ flower behind the left ear
  {
    const hit = skin.ray(V(0.075, 1, 0.44), V(0, -1, 0))!;
    const n = hit.n.clone().add(V(0, 0, 0.5)).normalize();
    const c = hit.at.clone().addScaledVector(hit.n, 0.008);
    const u = V(0, 0, 1).sub(n.clone().multiplyScalar(n.z)).normalize();
    const v = n.clone().cross(u);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const out = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
      b.part(new THREE.SphereGeometry(1, 6, 4), PETAL, {
        at: c.clone().addScaledVector(out, 0.021),
        dir: out,
        up: n,
        scale: [0.009, 0.019, 0.004],
        bone: head,
      });
    }
    b.part(new THREE.SphereGeometry(1, 8, 6), CENTER, { at: c.clone().addScaledVector(n, 0.002), scale: [0.013, 0.013, 0.01], bone: head });
  }

  // ------------------------------------------------------------------ the bird
  const crown = skin.ray(V(0, 1.2, 0.42), V(0, -1, 0))!;
  const UP = V(0, 1, 0);
  const yaw = 28 * DEG;
  const F = V(Math.sin(yaw), 0, Math.cos(yaw));
  const L = UP.clone().cross(F);
  const bp = (x: number, y: number, z: number) =>
    crown.at.clone().addScaledVector(L, x).addScaledVector(UP, y).addScaledVector(F, z);
  const bpDir = (x: number, y: number, z: number) => L.clone().multiplyScalar(x).addScaledVector(UP, y).addScaledVector(F, z);
  const place = (c: THREE.Vector3, r: number[], color: string | ReturnType<typeof paint>, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), color, { at: c, scale: r, dir: F, up: UP, axis: "z", bone });

  const bird = b.joint("birdBody", { parent: head, at: bp(0, 0.055, 0), aim: bp(0, 0.055, 0.1) });
  const birdHead = b.joint("birdHead", { parent: bird, at: bp(0, 0.1, 0.04), aim: bp(0, 0.1, 0.14) });
  const beakUp = b.joint("beakUp", { parent: birdHead, at: bp(0, 0.108, 0.074), aim: bp(0, 0.108, 0.13), role: "hinge" });
  const beakLow = b.joint("beakLow", { parent: birdHead, at: bp(0, 0.1, 0.072), aim: bp(0, 0.1, 0.12), role: "jaw" });
  const birdTail = b.joint("birdTail", { parent: bird, at: bp(0, 0.06, -0.05), aim: bp(0, 0.06, -0.14), role: "tail" });
  const wings = [1, -1].map((s) =>
    b.joint(`birdWing${s > 0 ? "L" : "R"}`, { parent: bird, at: bp(s * 0.04, 0.085, 0.03), aim: bp(s * 0.04, 0.085, -0.06), role: "wing" }),
  );

  const BODY_PAINT = paint((_p, n) => {
    if (n.y > 0.4) return BLUE;
    if (n.y < -0.55) return CREAM;
    return n.dot(F) > -0.25 ? BREAST : BLUE;
  });
  place(bp(0, 0.058, 0), [0.05, 0.05, 0.066], BODY_PAINT, bird);
  place(bp(0, 0.1, 0.042), [0.038, 0.037, 0.037], countershade(BLUE, BREAST, { level: -0.15, soft: 0.2 }), birdHead);
  // cheek patches
  for (const s of [1, -1]) {
    place(bp(s * 0.031, 0.096, 0.056), [0.01, 0.013, 0.012], CREAM, birdHead);
    // eyes
    place(bp(s * 0.03, 0.113, 0.062), [0.0085, 0.0085, 0.0085], BLACK, birdHead);
    place(bp(s * 0.034, 0.1165, 0.0675), [0.0028, 0.0028, 0.0028], "#ffffff", birdHead);
  }
  // beak, slightly open: singing
  b.spike(bp(0, 0.108, 0.072), F, 0.045, 0.0135, { color: BEAK, bone: beakUp, sides: 6 });
  b.spike(bp(0, 0.098, 0.07), F, 0.036, 0.0105, { color: "#e89a14", bone: beakLow, sides: 6 });
  b.pose(beakLow, { axis: L, deg: 16 });
  // crest
  for (let i = 0; i < 3; i++) {
    const f = i - 1;
    b.spike(bp(f * 0.009, 0.135, 0.032 - Math.abs(f) * 0.006), bpDir(f * 0.25, 1, -0.7), 0.035 - Math.abs(f) * 0.006, 0.007, {
      color: NAVY,
      bone: birdHead,
      sides: 5,
    });
  }
  // wings
  const wingOutline: [number, number][] = [
    [0, 0],
    [0.03, 0.03],
    [0.075, 0.016],
    [0.118, -0.018, "sharp"] as unknown as [number, number],
    [0.07, -0.03],
    [0.03, -0.038],
    [-0.006, -0.02],
  ];
  for (const s of [1, -1]) {
    const w = wings[s > 0 ? 0 : 1];
    const x = F.clone().multiplyScalar(-1);
    const y = UP.clone().addScaledVector(L, s * 0.18).normalize();
    const wingPaint = paint((_p, n, c) => {
      if (Math.abs(n.dot(L)) < 0.4) return NAVY;
      if (c[0] > 0.085) return NAVY;
      if (c[0] > 0.05 && c[0] < 0.062) return CREAM;
      if (c[0] > 0.062 && c[1] < -0.014) return NAVY;
      return BLUE;
    });
    b.extrude(wingOutline, { at: bp(s * 0.045, 0.085, 0.035), x, y, thickness: 0.012, bevel: 0.004, smoothing: 1, color: wingPaint, bone: w, name: `birdWing${s > 0 ? "L" : "R"}` });
  }
  // tail feathers
  const tailOutline: [number, number][] = [
    [0, -0.011],
    [0.07, -0.016],
    [0.095, -0.004],
    [0.095, 0.004],
    [0.07, 0.016],
    [0, 0.011],
  ];
  for (let i = -1; i <= 1; i++) {
    const a = i * 14 * DEG;
    const x = F.clone().multiplyScalar(-Math.cos(a)).addScaledVector(L, Math.sin(a));
    const tailPaint = paint((_p, _n, c) => (c[0] > 0.078 ? NAVY : i === 0 ? NAVY : BLUE));
    b.extrude(tailOutline, { at: bp(0, 0.058, -0.052), x, y: UP, thickness: 0.007, smoothing: 1, color: tailPaint, bone: birdTail, name: `birdTail${i + 1}` });
  }
  b.pose(birdTail, { axis: L, deg: 18 });
  // legs and toes gripping the fur
  for (const s of [1, -1]) {
    const top = bp(s * 0.02, 0.025, 0.005);
    const foot = bp(s * 0.022, -0.004, 0.01);
    b.rod(top, foot, 0.0045, BIRD_LEG, { bone: bird, sides: 5 });
    for (let k = -1; k <= 1; k++) {
      const toeEnd = bp(s * 0.022 + k * 0.013, -0.006, 0.04 - Math.abs(k) * 0.006);
      b.rod(foot, toeEnd, 0.0035, BIRD_LEG, { bone: bird, sides: 4 });
    }
  }

  return b.root;
}
