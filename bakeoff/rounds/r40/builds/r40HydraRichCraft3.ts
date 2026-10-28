import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  aim,
  catmull,
  limb,
  rng,
  countershade,
  scales,
  mottle,
  paint,
  noise,
  mix,
  smoothstep,
  resolve,
  svg,
  DEG,
} from "../../../../src/index";
import type { ColorInput, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Hydra of the Broken Chains",
  description:
    "Five-headed Nordic-myth hydra in a God of War mood: scarred green-black hide, bone armour, rune-lit brows, ember eyes, iron shackles and a frost axe buried in its back.",
};

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "hydra", paintSize: 2048 });
  const R = rng(11);
  const Y = new THREE.Vector3(0, 1, 0);

  // ------------------------------------------------------------------ palette
  const BONE = "#d8cdb0";
  const BONE_D = "#8f8368";
  const CLAW = "#2a241d";
  const EMBER = "#ff6a1f";
  const ICE = "#74d6ff";
  const TONGUE = "#8a2a30";
  const STEEL = "#4f535c";
  const WOOD = "#4a3621";

  // ------------------------------------------------------------------ paints
  const SCALE_P = scales(["#2e3f37", "#364a3e", "#2a382f", "#323f3a"], "#0c1312", { size: 0.075, width: 0.18, seed: 3 });
  const hideAt = (p: THREE.Vector3, n: THREE.Vector3) => {
    let c = resolve(SCALE_P, p, n);
    c = mix(c, "#7c745c", 0.34 * smoothstep(0.35, 0.95, n.y) * smoothstep(0.35, 0.7, noise(p, 0.3, 5)));
    c = mix(c, "#07090a", 0.4 * smoothstep(0.0, -0.9, n.y));
    const mud = smoothstep(0.34 + 0.14 * noise(p, 0.16, 7), 0.05, p.y);
    return mix(c, "#3b2e21", 0.85 * mud);
  };
  const HIDEP = paint((p, n) => hideAt(p, n));
  const SCUTE = mottle("#a39874", "#7f7658", { size: 0.09, seed: 2 });
  const skinPaint = (freq: number) =>
    paint((p, n, s) => {
      const a = ((s[1] % 360) + 360) % 360;
      if (Math.abs(a - 180) < 46 + 10 * noise(p, 0.18, 9)) return (s[0] * freq) % 1 < 0.13 ? "#3a3324" : SCUTE;
      return hideAt(p, n);
    });
  const NECKP = skinPaint(34);
  const BODYP = skinPaint(22);
  const TAILP = skinPaint(18);
  const HEAD_SC = scales(["#33473b", "#3c5144", "#2f4036"], "#0c1312", { size: 0.045, width: 0.18, seed: 8 });
  const HEADP = paint((p, n) => {
    let c = resolve(HEAD_SC, p, n);
    c = mix(c, "#7a725a", 0.3 * smoothstep(0.4, 0.95, n.y) * smoothstep(0.3, 0.7, noise(p, 0.12, 4)));
    return mix(c, "#9a8f6c", 0.85 * smoothstep(-0.25, -0.8, n.y));
  });
  const HORNP = paint((p, _n, s) =>
    mix(mix("#e4d9bb", "#b3a583", noise(p, 0.05, 4)), "#2d241d", smoothstep(0.55, 1, s[0])),
  );
  const PLATE = panelled(metal("bronze", { tarnish: 0.6, verdigris: 0.5, size: 0.12 }), { size: 0.2, rivets: 0.045 });
  const IRON = metal("iron", { tarnish: 0.5 });

  // ------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 100 64">
      <path d="M3 42 Q32 6 97 16 Q68 58 3 42Z" fill="#0d0607"/>
      <path d="M11 40 Q34 15 90 20 Q66 50 11 40Z" fill="#ff8a1c"/>
      <path d="M24 38 Q52 24 88 22 Q66 46 24 38Z" fill="#ffd25a"/>
      <ellipse cx="55" cy="31" rx="4.6" ry="12" fill="#140706" transform="rotate(12 55 31)"/>
      <path d="M11 40 Q34 15 90 20" fill="none" stroke="#0d0607" stroke-width="5"/>
      <circle cx="45" cy="25" r="2.6" fill="#fff4cf"/>
    </svg>`,
    { size: 256 },
  );
  const BLIND = svg(
    `<svg viewBox="0 0 100 64">
      <path d="M3 42 Q32 6 97 16 Q68 58 3 42Z" fill="#0d0607"/>
      <path d="M11 40 Q34 15 90 20 Q66 50 11 40Z" fill="#c9d0c4"/>
      <ellipse cx="52" cy="31" rx="9" ry="9" fill="#97a29a"/>
      <path d="M30 6 L72 60" stroke="#7a1913" stroke-width="5" stroke-linecap="round"/>
      <path d="M36 14 l-6 4 M44 26 l-7 3 M52 38 l-7 3 M60 48 l-7 3" stroke="#d8cdb0" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );
  const slash = (x0: number, y0: number, x1: number, y1: number) => {
    let stitches = "";
    for (let i = 1; i < 7; i++) {
      const t = i / 7;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      stitches += `<path d="M${x - 6} ${y - 1.5} L${x + 6} ${y + 1.5}" stroke="#3a2a1c" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    return `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="#d7c3a0" stroke-width="7" stroke-linecap="round"/>
      <path d="M${x0} ${y0} L${x1} ${y1}" stroke="#6b241c" stroke-width="2.4" stroke-linecap="round"/>${stitches}`;
  };
  const SCARS = svg(
    `<svg viewBox="0 0 80 100">${slash(18, 6, 40, 94)}${slash(36, 2, 58, 90)}${slash(54, 8, 76, 96)}</svg>`,
    { size: 256 },
  );
  const crack = (d: string) =>
    `<path d="${d}" fill="none" stroke="#2a0c06" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="${d}" fill="none" stroke="#ff5a1c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="${d}" fill="none" stroke="#ffd27a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const CRACKS = svg(
    `<svg viewBox="0 0 120 120">
      ${crack("M60 4 L52 24 L64 40 L48 60 L58 78 L44 100 L50 118")}
      ${crack("M64 40 L84 46 L94 66 L88 86")}
      ${crack("M48 60 L28 66 L20 86")}
      ${crack("M58 78 L76 94 L72 112")}
      ${crack("M52 24 L36 20 L26 8")}
    </svg>`,
    { size: 384 },
  );
  const GLYPHS = [
    "M6 30 V4 M6 12 L18 4 M6 20 L18 12",
    "M6 4 V30 M6 10 L18 17 L6 24",
    "M6 4 V30 M6 6 L18 14 M6 14 L18 22",
    "M6 4 V30 M6 4 L16 4 L18 10 L6 18 M6 18 L18 30",
    "M16 6 L6 17 L16 28",
    "M5 5 L19 29 M19 5 L5 29",
  ];
  const runeRow = (stroke: string, w: number) =>
    GLYPHS.map(
      (d, i) =>
        `<path transform="translate(${i * 25} 2)" d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`,
    ).join("");
  const RUNES = svg(`<svg viewBox="0 0 150 36">${runeRow("#1a0d09", 7.5)}${runeRow("#ff8a2a", 3.6)}</svg>`, {
    size: 640,
  });
  const tyr = (stroke: string, w: number) =>
    `<circle cx="32" cy="32" r="26" fill="none" stroke="${stroke}" stroke-width="${w}"/>
     <path d="M32 50 V14 M20 26 L32 14 L44 26" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const TYR = svg(`<svg viewBox="0 0 64 64">${tyr("#1a0d09", 8)}${tyr("#ff8a2a", 4)}</svg>`, { size: 256 });
  const WARPAINT = svg(
    `<svg viewBox="0 0 60 100">
      <path d="M14 0 L46 0 L44 40 L47 62 L40 96 L35 66 L30 98 L26 64 L19 88 L18 50 Z" fill="#a3150f"/>
      <path d="M22 0 L22 46 M32 0 L33 70 M40 4 L41 40" stroke="#5a0a08" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M18 6 L19 36" stroke="#d6402a" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ skeleton
  const pelvis = b.joint("pelvis", { at: [0, 1.55, -1.0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.55, -1.0],
      [0, 1.64, -0.25],
      [0, 1.74, 0.5],
      [0, 1.85, 1.15],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.5, -1.2],
      [0, 1.4, -2.2],
      [0, 1.15, -3.2],
      [0, 0.85, -4.2],
      [0, 0.6, -5.1],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ------------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 1.5, -1.55], w: 0.8, h: 0.85 },
      { at: [0, 1.55, -1.05], w: 1.35, h: 1.3 },
      { at: [0, 1.6, -0.25], w: 1.5, h: 1.4 },
      { at: [0, 1.7, 0.5], w: 1.6, h: 1.5 },
      { at: [0, 1.8, 1.15], w: 1.55, h: 1.55 },
      { at: [0, 1.88, 1.6], w: 1.1, h: 1.2 },
    ],
    { bone: spine, color: BODYP },
  );
  const mound = b.part(new THREE.SphereGeometry(1, 12, 8), HIDEP, {
    bone: chest,
    at: [0, 2.25, 1.0],
    scale: [0.95, 0.65, 0.85],
  });
  // dorsal armour plates and spikes
  b.along(
    body,
    5,
    (at) => {
      const r = 0.34 - 0.08 * at.t;
      b.stick(new THREE.CylinderGeometry(r * 0.8, r, 0.07, 8), PLATE, at, { embed: 0.35 });
      b.spike(at, at, 0.3 - 0.1 * at.t, 0.06, { color: BONE_D });
    },
    { from: 0, to: 0.62 },
  );

  // tail
  const tailSw = b.sweep(tail, (t) => 0.4 * Math.pow(1 - t, 1.2) + 0.05, { color: TAILP });
  b.along(tailSw, 7, (at) => b.spike(at, at, 0.3 - 0.22 * at.t, 0.06 - 0.04 * at.t, { color: BONE_D }));
  b.spike(tail.at(1), tail.at(1), 0.55, 0.1, { color: BONE });
  b.ring(tail.at(0.92), { count: 6, radius: 0.07, tilt: 45 }, (it) => b.spike(it, it, 0.35, 0.05, { color: BONE_D }));

  // ------------------------------------------------------------------ feet and cuffs
  const paw = (tip: Joint, p: V3, big: number) => {
    const [x, , z] = p;
    b.part(new THREE.SphereGeometry(1, 8, 6), HIDEP, {
      bone: tip,
      at: [x, 0.11, z + 0.1 * big],
      scale: [0.21 * big, 0.12, 0.3 * big],
    });
    for (const j of [-1, 0, 1]) {
      const base: V3 = [x + j * 0.12 * big, 0.09, z + 0.26 * big];
      const end: V3 = [x + j * 0.17 * big, 0.07, z + 0.5 * big];
      b.capsule(base, end, 0.058 * big, { bone: tip, color: HIDEP });
      b.spike(end, [j * 0.12, -0.3, 1], 0.2 * big, 0.042 * big, { bone: tip, color: CLAW });
    }
  };
  const cuff = (at: Parameters<typeof b.ring>[0], r: number) => {
    const items = b.ring(at, { count: 10, radius: r }).items;
    b.sweep(catmull(items, { closed: true }), 0.032, { color: IRON, sides: 5 });
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // fore leg
    const sh: V3 = [s * 0.8, 1.6, 0.95];
    const hand: V3 = [s * 0.92, 0.13, 1.2];
    const fl = b.chain(`legF${sd}`, limb(sh, hand, [0.86, 0.86], [[0, 0, -1]]), {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `hand${sd}`],
      role: "leg",
      contact: [hand[0], 0, hand[2]],
    });
    b.sweep(fl, (t) => 0.3 - 0.14 * t + 0.04 * Math.sin(t * Math.PI), { color: HIDEP });
    paw(fl.joints[fl.joints.length - 1], hand, 1.0);
    b.part(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), PLATE, {
      bone: fl.joints[0],
      at: [s * 0.95, 1.95, 0.9],
      rotation: [0, 0, -s * 25],
      scale: [0.5, 0.34, 0.55],
    });
    for (const dz of [-0.3, 0, 0.3])
      b.spike([s * (1.09 + (dz === 0 ? 0 : -0.06)), 2.2, 0.9 + dz], [s * 0.35, 1, 0], dz === 0 ? 0.34 : 0.22, 0.065, {
        bone: fl.joints[0],
        color: BONE,
      });
    b.spike(fl.joints[1], [s * 0.3, 0.2, -1], 0.3, 0.07, { bone: fl.joints[1], color: BONE_D });
    cuff(fl.at(0.8), 0.22);

    // hind leg (digitigrade)
    const hip: V3 = [s * 0.82, 1.6, -1.0];
    const foot: V3 = [s * 0.98, 0.13, -1.3];
    const hp = limb(hip, foot, [0.9, 0.85, 0.55], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hl = b.chain(`legH${sd}`, hp, {
      parent: pelvis,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `foot${sd}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    b.part(new THREE.SphereGeometry(1, 10, 7), HIDEP, {
      bone: hl.joints[0],
      at: [s * 0.78, 1.6, -1.0],
      scale: [0.5, 0.58, 0.62],
    });
    b.sweep(hl, (t) => 0.32 - 0.17 * t, { color: HIDEP });
    paw(hl.joints[hl.joints.length - 1], foot, 1.15);
    b.spike(hp[2], [s * 0.2, 0.3, -1], 0.34, 0.075, { bone: hl.joints[2], color: BONE_D });
    b.spike(hp[1], [s * 0.3, 0.2, 1], 0.22, 0.06, { bone: hl.joints[1], color: BONE_D });
  }

  // ------------------------------------------------------------------ head building kit
  class HF {
    O: THREE.Vector3;
    Q: THREE.Quaternion;
    bone: Joint;
    k: number;
    constructor(O: THREE.Vector3, Q: THREE.Quaternion, bone: Joint, k: number) {
      this.O = O;
      this.Q = Q;
      this.bone = bone;
      this.k = k;
    }
    P(x: number, y: number, z: number) {
      return new THREE.Vector3(x * this.k, y * this.k, z * this.k).applyQuaternion(this.Q).add(this.O);
    }
    D(x: number, y: number, z: number) {
      return new THREE.Vector3(x, y, z).normalize().applyQuaternion(this.Q);
    }
    place(geo: THREE.BufferGeometry, color: ColorInput, p: V3, size: V3, rot: V3 = [0, 0, 0]) {
      const q = this.Q.clone().multiply(
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      );
      return b.part(geo, color, {
        bone: this.bone,
        at: this.P(p[0], p[1], p[2]),
        quat: q,
        scale: size.map((v) => v * this.k) as V3,
      });
    }
    ell(color: ColorInput, p: V3, r: V3, rot?: V3) {
      return this.place(new THREE.SphereGeometry(1, 10, 7), color, p, r, rot);
    }
    box(color: ColorInput, p: V3, sz: V3, rot?: V3) {
      return this.place(new THREE.BoxGeometry(1, 1, 1), color, p, sz, rot);
    }
  }
  type Tooth = { p: V3; d: V3; len: number; r: number };
  const teeth = (hf: HF, list: Tooth[], color: string) => {
    const gs = list.map((t) => {
      const len = t.len * hf.k;
      const g = new THREE.ConeGeometry(t.r * hf.k, len, 5, 1);
      g.translate(0, len / 2, 0);
      g.applyMatrix4(
        new THREE.Matrix4().compose(hf.P(t.p[0], t.p[1], t.p[2]), aim(hf.D(t.d[0], t.d[1], t.d[2])), new THREE.Vector3(1, 1, 1)),
      );
      return g;
    });
    return b.part(mergeGeometries(gs)!, color, { bone: hf.bone, at: [0, 0, 0], flat: true });
  };
  const lerpn = (a: number, c: number, t: number) => a + (c - a) * t;
  const hornTube = (hf: HF, pts: V3[], r0: number, r1: number, flatEnd = false) =>
    b.sweep(catmull(pts.map((p) => hf.P(p[0], p[1], p[2]))), [r0 * hf.k, r1 * hf.k], {
      bone: hf.bone,
      color: HORNP,
      sides: 6,
      caps: { start: "flat", end: r1 === 0 && !flatEnd ? "point" : "flat" },
    });

  type HeadCfg = { k: number; open: number; yaw: number; pitch: number; horns: number; blind?: boolean; fire?: boolean };

  const buildHead = (
    id: string,
    chain: ReturnType<typeof b.chain>,
    path: ReturnType<typeof catmull>,
    cfg: HeadCfg,
  ) => {
    const k = cfg.k;
    const end = path.at(1);
    const f = path.tangentAt(1).clone().add(new THREE.Vector3(cfg.yaw, -cfg.pitch, 0)).normalize();
    const Q = aim(f, Y, "z");
    const head = b.joint(`head${id}`, {
      parent: chain.joints[chain.joints.length - 1],
      at: end,
      dir: f,
      up: Y,
      role: "head",
    });
    const hf = new HF(new THREE.Vector3(end.x, end.y, end.z), Q, head, k);

    // skull
    const cranium = hf.ell(HEADP, [0, 0, 0.2], [0.23, 0.2, 0.3]);
    for (const s of [1, -1]) hf.ell(HEADP, [s * 0.13, 0.14, 0.34], [0.1, 0.045, 0.19], [14, 0, 0]);
    const snout = b.frustumBox(hf.P(0, -0.01, 0.35), hf.P(0, -0.03, 1.0), [0.4 * k, 0.26 * k], [0.28 * k, 0.15 * k], {
      bone: head,
      color: HEADP,
    });
    hf.ell(HEADP, [0, -0.035, 1.0], [0.14, 0.078, 0.09]);
    hf.ell(BONE_D, [0, 0.06, 0.8], [0.07, 0.035, 0.22], [-6, 0, 0]);
    for (const s of [1, -1]) glow(hf.ell(EMBER, [s * 0.06, 0.016, 1.06], [0.03, 0.025, 0.03]), 1);
    // palate
    b.frustumBox(hf.P(0, -0.15, 0.35), hf.P(0, -0.115, 0.95), [0.3 * k, 0.02 * k], [0.2 * k, 0.02 * k], {
      bone: head,
      color: "#4a1214",
    });

    // upper teeth
    const up: Tooth[] = [];
    const ulen = [0.07, 0.09, 0.07, 0.1, 0.08, 0.17];
    for (const s of [1, -1])
      for (let j = 0; j < 6; j++) {
        const z = 0.5 + j * 0.085;
        const u = (z - 0.35) / 0.65;
        up.push({
          p: [s * (lerpn(0.2, 0.14, u) - 0.015), lerpn(-0.14, -0.105, u) + 0.012, z],
          d: [s * 0.05, -1, 0.12],
          len: ulen[j],
          r: j === 5 ? 0.032 : 0.024,
        });
      }
    teeth(hf, up, BONE);

    // lower jaw
    const Jo = hf.P(0, -0.16, 0.12);
    const Qj = Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), cfg.open * DEG));
    const jdir = new THREE.Vector3(0, 0, 1).applyQuaternion(Qj);
    const jaw = b.joint(`jaw${id}`, {
      parent: head,
      at: Jo,
      aim: Jo.clone().addScaledVector(jdir, 0.5),
      up: Y,
      role: "jaw",
    });
    const jf = new HF(Jo, Qj, jaw, k);
    b.frustumBox(jf.P(0, -0.015, 0.03), jf.P(0, -0.025, 0.9), [0.36 * k, 0.12 * k], [0.2 * k, 0.08 * k], {
      bone: jaw,
      color: HEADP,
    });
    jf.ell(HEADP, [0, -0.025, 0.9], [0.1, 0.05, 0.07]);
    const tongue = b.frustumBox(jf.P(0, 0.05, 0.1), jf.P(0, 0.05, 0.78), [0.2 * k, 0.03 * k], [0.1 * k, 0.025 * k], {
      bone: jaw,
      color: cfg.fire ? "#c2401c" : TONGUE,
    });
    if (cfg.fire) glow(tongue, 0.8);
    const low: Tooth[] = [];
    const llen = [0.07, 0.08, 0.07, 0.09, 0.08, 0.15];
    for (const s of [1, -1])
      for (let j = 0; j < 6; j++) {
        const z = 0.3 + 0.09 * j;
        const u = (z - 0.03) / 0.87;
        low.push({
          p: [s * (lerpn(0.17, 0.09, u) - 0.012), 0.036, z],
          d: [-s * 0.05, 1, -0.1],
          len: llen[j],
          r: j === 5 ? 0.03 : 0.022,
        });
      }
    teeth(jf, low, BONE);
    for (const s of [1, -1]) {
      b.spike(jf.P(s * 0.08, -0.05, 0.72), jf.D(s * 0.2, -1, 0.5), 0.17 * k, 0.04 * k, { bone: jaw, color: BONE_D });
      b.spike(jf.P(s * 0.17, -0.02, 0.1), jf.D(s * 0.8, -0.2, -0.8), 0.28 * k, 0.05 * k, { bone: jaw, color: HORNP });
    }

    // eyes
    for (const s of [1, -1]) {
      const blind = cfg.blind && s === 1;
      const e = b.decal(cranium, blind ? BLIND : EYE, {
        at: hf.P(s * 0.2, 0.07, 0.3),
        dir: hf.D(s, 0.25, 0.35),
        up: hf.D(0, 1, 0),
        size: [0.19 * k, 0.125 * k],
        segments: 8,
        mirror: s < 0,
        bone: head,
      });
      if (!blind) glow(e, 1.3);
    }

    // cheek frills
    const nFrill = cfg.horns === 2 ? 3 : 2;
    for (const s of [1, -1])
      for (let j = 0; j < nFrill; j++)
        b.spike(hf.P(s * 0.2, 0.0 + 0.03 * j, 0.02), hf.D(s * 0.7, 0.35 * (j - 1), -1), (0.3 - 0.05 * j) * k, 0.05 * k, {
          bone: head,
          color: HORNP,
        });

    // horns by head
    switch (cfg.horns) {
      case 0:
        hornTube(hf, [[0.12, 0.1, 0.05], [0.28, 0.3, -0.12], [0.34, 0.55, -0.4], [0.28, 0.75, -0.8]], 0.075, 0);
        hornTube(hf, [[-0.12, 0.1, 0.05], [-0.24, 0.24, -0.08], [-0.27, 0.34, -0.18]], 0.07, 0.05);
        b.spike(hf.P(-0.27, 0.34, -0.18), hf.D(-0.2, 1, -0.3), 0.12 * k, 0.04 * k, { bone: head, color: BONE_D });
        b.spike(hf.P(-0.25, 0.33, -0.17), hf.D(-0.9, 0.5, -0.2), 0.09 * k, 0.03 * k, { bone: head, color: BONE_D });
        break;
      case 1:
        for (const s of [1, -1])
          hornTube(
            hf,
            [[s * 0.15, 0.1, 0.05], [s * 0.34, 0.2, -0.08], [s * 0.4, 0.02, -0.25], [s * 0.26, -0.1, -0.22], [s * 0.2, -0.05, -0.05]],
            0.085,
            0.015,
          );
        break;
      case 2:
        for (const s of [1, -1])
          hornTube(hf, [[s * 0.12, 0.14, 0.08], [s * 0.3, 0.4, -0.1], [s * 0.34, 0.75, -0.45], [s * 0.2, 1.1, -0.85]], 0.09, 0);
        for (let j = -2; j <= 2; j++)
          b.spike(hf.P(j * 0.07, 0.17, 0.0), hf.D(j * 0.15, 0.6, -0.8), (0.34 - Math.abs(j) * 0.05) * k, 0.045 * k, {
            bone: head,
            color: BONE,
          });
        break;
      case 3:
        for (const s of [1, -1]) {
          const sw = hornTube(hf, [[s * 0.14, 0.14, 0.08], [s * 0.24, 0.38, -0.05], [s * 0.3, 0.62, -0.3], [s * 0.22, 0.9, -0.5]], 0.06, 0);
          b.along(sw, 3, (at) =>
            b.spike(at, at, (0.28 - 0.08 * at.t) * k, 0.032 * k, { bone: head, color: BONE_D }),
          );
        }
        break;
      default:
        for (const s of [1, -1])
          hornTube(hf, [[s * 0.2, 0.1, 0.22], [s * 0.42, 0.14, 0.3], [s * 0.55, 0.3, 0.45], [s * 0.5, 0.55, 0.6]], 0.08, 0);
        b.spike(hf.P(0, 0.06, 0.95), hf.D(0, 0.6, 1), 0.28 * k, 0.06 * k, { bone: head, color: BONE });
        {
          const plate = hf.box(BONE, [0, 0.215, 0.3], [0.34, 0.05, 0.4]);
          glow(
            b.decal(plate, TYR, {
              at: hf.P(0, 0.242, 0.3),
              dir: hf.D(0, 1, 0),
              up: hf.D(0, 0, 1),
              size: [0.22 * k, 0.22 * k],
              segments: 4,
              bone: head,
            }),
            1.2,
          );
        }
        break;
    }

    // decals per head
    if (cfg.horns === 2)
      b.decal([cranium, snout], WARPAINT, {
        at: hf.P(0, 0.1, 0.5),
        dir: hf.D(0, 1, 0),
        up: hf.D(0, 0, -1),
        size: [0.22 * k, 0.9 * k],
        segments: 14,
        bone: head,
      });
    if (cfg.horns === 1 || cfg.horns === 3)
      b.decal(snout, SCARS, {
        at: hf.P(cfg.horns === 1 ? 0.15 : -0.15, 0.0, 0.68),
        dir: hf.D(cfg.horns === 1 ? 1 : -1, 0.1, 0.2),
        up: hf.D(0, 1, 0),
        size: [0.2 * k, 0.25 * k],
        segments: 6,
        bone: head,
      });
    return head;
  };

  // ------------------------------------------------------------------ necks
  const NECKS: {
    bx: number; by: number; bz: number; dx: number; dy: number; dz: number; dr: number; r: number; head: HeadCfg;
  }[] = [
    { bx: 0.62, by: 2.15, bz: 0.9, dx: 1.5, dy: 1.25, dz: 1.8, dr: 0.45, r: 1.0, head: { k: 0.9, open: 12, yaw: 0.15, pitch: 0.1, horns: 0, blind: true } },
    { bx: 0.32, by: 2.25, bz: 1.0, dx: 0.8, dy: 2.1, dz: 2.1, dr: 0.4, r: 1.0, head: { k: 0.95, open: 16, yaw: 0.1, pitch: 0.1, horns: 1 } },
    { bx: 0, by: 2.35, bz: 1.1, dx: 0, dy: 2.6, dz: 1.6, dr: 0.55, r: 1.12, head: { k: 1.1, open: 11, yaw: 0, pitch: 0.15, horns: 2, fire: true } },
    { bx: -0.32, by: 2.25, bz: 1.0, dx: -0.9, dy: 2.0, dz: 2.6, dr: 0.3, r: 1.0, head: { k: 0.95, open: 18, yaw: -0.1, pitch: 0.12, horns: 3 } },
    { bx: -0.62, by: 2.15, bz: 0.9, dx: -1.6, dy: 1.15, dz: 1.9, dr: 0.5, r: 1.0, head: { k: 0.88, open: 14, yaw: -0.15, pitch: 0.1, horns: 4, fire: true } },
  ];

  const hang = (S: THREE.Vector3, bone: Joint, n: number) => {
    const gs: THREE.BufferGeometry[] = [];
    for (let j = 0; j < n; j++) {
      const g = new THREE.TorusGeometry(0.05, 0.016, 5, 8);
      const q = j % 2 ? new THREE.Quaternion().setFromAxisAngle(Y, Math.PI / 2) : new THREE.Quaternion();
      g.applyMatrix4(
        new THREE.Matrix4().compose(
          new THREE.Vector3(S.x + 0.02 * Math.sin(j * 1.3), S.y - 0.08 - j * 0.092, S.z + 0.025 * Math.cos(j)),
          q,
          new THREE.Vector3(0.9, 1.4, 1),
        ),
      );
      gs.push(g);
    }
    const e = new THREE.TorusGeometry(0.09, 0.03, 5, 9, Math.PI * 1.4);
    e.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(S.x, S.y - 0.2 - n * 0.092, S.z),
        new THREE.Quaternion().setFromAxisAngle(Y, 0.6),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    gs.push(e);
    b.part(mergeGeometries(gs)!, IRON, { bone, at: [0, 0, 0], flat: true });
  };

  const onNeck = (
    sw: ReturnType<typeof b.sweep>,
    t: number,
    deg: number,
    tex: THREE.Texture,
    size: [number, number],
    alongNeck: boolean,
    glowIt: number,
  ) => {
    const sp = sw.at(t, deg);
    const T = sp.tangent.clone();
    const upv = alongNeck ? sp.n.clone().cross(T) : T;
    const d = b.decal(sw, tex, { at: sp.at, dir: sp.n, up: upv, size, segments: 14 });
    if (glowIt) glow(d, glowIt);
  };

  NECKS.forEach((c, i) => {
    const id = "ABCDE"[i];
    const pts: V3[] = [];
    for (let kk = 0; kk <= 5; kk++) {
      const t = kk / 5;
      pts.push([
        c.bx + c.dx * Math.pow(t, 1.2),
        c.by + c.dy * (1 - Math.pow(1 - t, 2)) - c.dr * Math.pow(t, 3),
        c.bz + c.dz * Math.pow(t, 1.5),
      ]);
    }
    const path = catmull(pts);
    const chain = b.chain(`neck${id}`, path, {
      parent: chest,
      names: [1, 2, 3, 4, 5].map((n) => `neck${id}${n}`),
      role: "neck",
    });
    const rad = (t: number) => c.r * (0.32 - 0.12 * t);
    const sw = b.sweep(chain, rad, { color: NECKP });
    b.along(sw, 7, (at) => {
      const j = 0.85 + 0.3 * R();
      b.spike(at, at, (0.09 + 0.1 * (1 - at.t)) * c.r * j, 0.032 * c.r, { color: BONE_D });
    });

    if (i === 1 || i === 3) {
      cuff(chain.at(0.55), rad(0.55) * 1.08);
      hang(sw.at(0.55, 180).at, chain.jointAt(0.55), i === 1 ? 7 : 5);
    }
    if (i === 2) {
      b.ring(chain.at(0.4), { count: 9, radius: rad(0.4) * 0.95, tilt: -35 }, (it) =>
        b.spike(it, it, 0.3, 0.055, { color: BONE }),
      );
      b.ring(chain.at(0.62), { count: 9, radius: rad(0.62) * 0.95, tilt: -35 }, (it) =>
        b.spike(it, it, 0.22, 0.045, { color: BONE_D }),
      );
      onNeck(sw, 0.3, 270, RUNES, [0.6, 0.16], true, 1.1);
    }
    if (i === 0) onNeck(sw, 0.5, 270, SCARS, [0.22, 0.28], false, 0);
    if (i === 4) onNeck(sw, 0.45, 270, CRACKS, [0.5, 0.5], false, 1.1);

    buildHead(id, chain, path, c.head);
  });

  // ------------------------------------------------------------------ body decals and war-torn gear
  const skin = b.surface(body);
  const flankR = skin.around([0, 1.7, 0]).at(-90, 5)!;
  b.decal(body, CRACKS, { at: flankR, dir: flankR.n, up: [0, 1, 0], size: [0.9, 0.9], segments: 16 });
  glow(
    b.decal(body, CRACKS, { at: flankR, dir: flankR.n, up: [0, 1, 0], size: [0.9, 0.9], segments: 16 }),
    1.1,
  );
  const flankL = skin.around([0, 1.7, 0]).at(90, 0)!;
  b.decal(body, SCARS, { at: flankL, dir: flankL.n, up: [0, 1, 0], size: [0.45, 0.6], segments: 12 });
  const flankL2 = skin.around([0, 1.7, 0]).at(88, 4)!;
  glow(b.decal(body, RUNES, { at: flankL2.moved([0, 0, 0]), dir: flankL2.n, up: [0, 1, 0], size: [0.9, 0.22], segments: 16 }), 1.0);

  // broken spears
  const spear = (h: { at: THREE.Vector3; n: THREE.Vector3; bone: Joint | null }, lean: V3, len: number) => {
    const d = h.n.clone().multiplyScalar(0.6).add(new THREE.Vector3(lean[0], lean[1], lean[2])).normalize();
    const bone = h.bone ?? chest;
    const a = h.at.clone().addScaledVector(d, -0.25);
    const e = h.at.clone().addScaledVector(d, len);
    b.rod(a, e, 0.024, WOOD, { bone });
    b.spike(e, d, 0.16, 0.026, { bone, color: "#2b2016" });
    b.rod(h.at.clone().addScaledVector(d, 0.1), h.at.clone().addScaledVector(d, 0.2), 0.036, PLATE, { bone });
  };
  const sb = b.surface(body);
  spear(sb.around([0, 1.7, 0]).at(100, 25)!, [0, 0.6, -0.5], 0.9);
  spear(sb.around([0, 1.7, 0]).at(-75, 40)!, [0, 0.7, -0.4], 1.1);
  spear(sb.around([0, 1.7, 0]).at(-130, 30)!, [0, 0.5, -0.8], 0.75);

  // the frost axe buried behind the necks
  const axHit = b.surface([body, mound]).ray([-0.5, 4, 0.3], [0, -1, 0])!;
  const upv = new THREE.Vector3(-0.2, 1, -0.45).normalize();
  const across = upv.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
  const A = axHit.at.clone().addScaledVector(upv, -0.18);
  const Bt = A.clone().addScaledVector(upv, 1.35);
  b.rod(A, Bt, 0.028, "#2c2118", { bone: chest });
  for (const t of [0.2, 0.35, 0.5])
    b.rod(A.clone().addScaledVector(upv, t * 1.35), A.clone().addScaledVector(upv, t * 1.35 + 0.08), 0.036, STEEL, { bone: chest });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), STEEL, { bone: chest, at: Bt });
  const C = A.clone().addScaledVector(upv, 1.05);
  b.extrude(
    [
      [0, -0.1], [0.1, -0.14], [0.32, -0.3], [0.46, -0.24], [0.4, -0.04],
      [0.4, 0.08], [0.46, 0.24], [0.32, 0.3], [0.1, 0.14], [0, 0.1],
    ],
    { at: C, x: across.toArray() as V3, y: upv.toArray() as V3, thickness: 0.035, bevel: 0.006, color: STEEL, bone: chest },
  );
  glow(
    b.extrude(
      [[0.12, -0.07], [0.3, -0.2], [0.38, -0.17], [0.33, -0.02], [0.33, 0.04], [0.38, 0.17], [0.3, 0.2], [0.12, 0.07]],
      { at: C, x: across.toArray() as V3, y: upv.toArray() as V3, thickness: 0.05, color: ICE, bone: chest },
    ),
    1.4,
  );
  b.spike(C, across.clone().negate(), 0.24, 0.04, { bone: chest, color: STEEL });

  return b.root;
}
