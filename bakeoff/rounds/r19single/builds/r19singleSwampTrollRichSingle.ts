// Swamp troll: hunched, long-armed jungle-troll in Blizzard/Warcraft proportions. Oversized head, tusks, hands and
// shoulders, hand-painted skin (painted highlights up top, shadow underneath, mud on the legs), a flame-coloured
// mohawk riding the skull and spine, and bone fetishes everywhere: skull necklace, belt bundles, bone pauldrons,
// arm bands and a back totem with glowing green eye sockets.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { grain, mix, noise, paint, smoothstep, spots } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import type { Surface } from "../../../../src/surface";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, hulking swamp troll with big curved tusks, a flame-coloured mohawk, mossy mottled skin and bone fetishes: skull necklace, belt bundles, bone pauldrons, arm bands and a back totem with glowing eyes.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const fract = (x: number) => x - Math.floor(x);

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const rand = rng(7);

  // ---------------------------------------------------------------------------------------------------- palette
  const INK = "#1b1410";
  const MOUTH = "#4b1722";
  const EYE = "#ffd23a";
  const GLOWG = "#7dff5a";
  const CORD = "#a8301f";
  const STEM = "#e3d8b8";
  const WART = "#8bb05a";

  const SKIN = paint((p, n) => {
    const big = noise(p, 0.45, 3);
    const fine = noise(p, 0.06, 8);
    let c: Rgb = mix("#355f43", "#6c9a4a", smoothstep(0.3, 0.72, big));
    c = mix(c, "#8aa94f", smoothstep(0.55, 0.85, fine) * 0.35);
    c = mix(c, "#a9c26e", smoothstep(0.15, 0.95, n.y) * 0.45);
    c = mix(c, "#1f3a38", smoothstep(0.05, -0.85, n.y) * 0.6);
    const belly =
      smoothstep(0.1, 0.6, n.z) * smoothstep(1.95, 1.65, p.y) * smoothstep(1.05, 1.2, p.y) * (Math.abs(p.x) < 0.5 ? 1 : 0);
    c = mix(c, "#b4c77c", belly * 0.7);
    const mud = smoothstep(0.42, 0.12, p.y + (noise(p, 0.1, 5) - 0.5) * 0.18);
    c = mix(c, "#4a3b27", mud * 0.85);
    if (p.z > 0.68 && p.y > 2.2 && p.y < 2.35 && Math.abs(p.x) > 0.1 && Math.abs(p.x) < 0.3) {
      if ((p.y * 38 + Math.abs(p.x) * 30) % 1 < 0.3) c = [0.95, 0.9, 0.75];
    }
    return c;
  });
  const BONE = paint((p, n) => {
    const base = mix("#b9a574", "#f4ecd0", smoothstep(-0.7, 0.8, n.y));
    return mix(base, "#8e7a50", smoothstep(0.55, 0.8, noise(p, 0.04, 4)) * 0.5);
  });
  const HIDE = paint((p, n) => {
    const base = mix("#4c2f1b", "#8d5d33", noise(p, 0.1, 2));
    return mix(base, "#c0905a", smoothstep(0.3, 0.95, n.y) * 0.3);
  });
  const FLAP = paint((p, n, s) => {
    let c: Rgb = mix("#5a3920", "#9a6a3c", noise(p, 0.1, 6));
    if (Math.abs(n.z) > 0.5) {
      const y = s[1];
      if (Math.abs(y + 0.07) < 0.012) c = [0.78, 0.2, 0.12];
      if (Math.abs(y + 0.11) < 0.006) c = [0.95, 0.85, 0.55];
      const k = Math.abs(fract(s[0] * 16) - 0.5);
      if (y < -0.16 && y > -0.16 - (0.5 - k) * 0.12) c = [0.15, 0.5, 0.45];
    }
    return c;
  });
  const CLAW = paint((_p, n) => mix("#2a211a", "#6b5a48", smoothstep(-0.7, 0.8, n.y)));
  const GOLD = paint((_p, n) => mix("#8a5a1c", "#f3c85a", smoothstep(-0.6, 0.8, n.y)));
  const LIP = paint((_p, n) => mix("#3a2433", "#7a4d5e", smoothstep(-0.6, 0.8, n.y)));
  const WOOD = grain("#5a3a22", "#7a5230", { size: 0.02, axis: "y" });
  const CAP = spots("#b5382a", "#f2e8c9", { size: 0.025, amount: 0.6 });
  const EAR = paint((p, n, s) => {
    if (Math.abs(s[1]) < 0.035 && s[0] > 0.06 && s[0] < 0.38) return mix("#8a5a5a", "#b97a78", noise(p, 0.05, 2));
    return SKIN;
    void n;
  });
  const MOHAWK = paint((_p, _n, s) => {
    const y = s[1];
    const a = mix("#7a0f1e", "#d7262b", smoothstep(0.0, 0.2, y));
    const c = mix(a, "#ff8a1e", smoothstep(0.18, 0.34, y));
    return mix(c, "#ffd24a", smoothstep(0.34, 0.46, y));
  });

  // ---------------------------------------------------------------------------------------------------- textures
  const featherSvg = (base: string, rib: string, barb: string, tip: string) =>
    svg(
      `<svg viewBox="0 0 32 100">
      <path d="M16 100 C3 72 1 30 16 0 C31 30 29 72 16 100Z" fill="${base}"/>
      <path d="M16 0 C8 14 8 24 16 32 C24 24 24 14 16 0Z" fill="${tip}"/>
      <path d="M16 80 L6 62 M16 62 L4 42 M16 80 L26 62 M16 62 L28 42" stroke="${barb}" stroke-width="1.8" fill="none"/>
      <path d="M16 100 L16 8" stroke="${rib}" stroke-width="2.4" fill="none"/>
    </svg>`,
      { size: 256 },
    );
  const FEATHER_RED = featherSvg("#c8342b", "#f0d9a2", "#e4603c", "#f2c14a");
  const FEATHER_TEAL = featherSvg("#2c8f86", "#e8e0b0", "#4fc2a8", "#e8e0b0");
  const MOSS = svg(
    `<svg viewBox="0 0 40 60">
      <path d="M2 60 Q4 32 0 10 Q12 30 12 60Z" fill="#46742a"/>
      <path d="M10 60 Q10 24 16 2 Q24 26 22 60Z" fill="#6c9c34"/>
      <path d="M20 60 Q24 30 34 6 Q34 34 30 60Z" fill="#8fbf45"/>
      <path d="M28 60 Q32 40 40 24 Q38 46 36 60Z" fill="#4f8030"/>
    </svg>`,
    { size: 128 },
  );
  const STRAND = svg(
    `<svg viewBox="0 0 24 80">
      <path d="M12 0 C3 18 21 38 9 80 C20 40 6 20 12 0Z" fill="#5e8f2e"/>
      <ellipse cx="9" cy="30" rx="5" ry="3" fill="#86b843"/>
      <ellipse cx="14" cy="50" rx="5" ry="3" fill="#86b843"/>
    </svg>`,
    { size: 192 },
  );
  const SIGIL = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="30" fill="none" stroke="#e8d9a0" stroke-width="4"/>
      <path d="M50 14 L58 42 L86 50 L58 58 L50 86 L42 58 L14 50 L42 42Z" fill="#b8321e"/>
      <circle cx="50" cy="50" r="7" fill="#e8d9a0"/>
      <path d="M12 22 L34 34 M88 22 L66 34 M12 78 L34 66 M88 78 L66 66" stroke="#e8d9a0" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M30 8 L70 8" stroke="#b8321e" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------------------------------- helpers
  const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const blob = (bone: Joint, at: THREE.Vector3, scale: number | number[], color: Fill, w = 10, h = 7) =>
    b.part(sph(w, h), color, { bone, at, scale });
  const ringAt = (cp: { at: THREE.Vector3; normal: THREE.Vector3; binormal: THREE.Vector3 }, r: number, n = 10) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return cp.at
        .clone()
        .addScaledVector(cp.normal, Math.cos(a) * r)
        .addScaledVector(cp.binormal, Math.sin(a) * r);
    });
  const topAt = (surf: Surface, x: number, z: number) => surf.ray([x, 3.2, z], [0, -1, 0]);

  const skull = (at: THREE.Vector3, k: number, bone: Joint, eyeColor: string, flip = false) => {
    const f = flip ? -1 : 1;
    const P = (x: number, y: number, z: number) => at.clone().add(v(x * k, y * k, z * k * f));
    blob(bone, at, [0.5 * k, 0.46 * k, 0.48 * k], BONE, 8, 6);
    b.part(new THREE.BoxGeometry(0.44 * k, 0.3 * k, 0.4 * k), BONE, { bone, at: P(0, -0.42, 0.28) });
    b.part(new THREE.BoxGeometry(0.4 * k, 0.14 * k, 0.32 * k), BONE, { bone, at: P(0, -0.62, 0.22) });
    for (const s of [1, -1]) {
      const e = blob(bone, P(s * 0.2, 0.0, 0.38), 0.13 * k, eyeColor, 6, 4);
      if (eyeColor !== INK) glow(e, 1.4);
    }
    blob(bone, P(0, -0.26, 0.48), [0.05 * k, 0.08 * k, 0.04 * k], INK, 6, 4);
    const teeth = [-2, -1, 0, 1, 2].map((i) => {
      const q = P(i * 0.085, -0.55, 0.46);
      return new THREE.BoxGeometry(0.05 * k, 0.12 * k, 0.04 * k).translate(q.x, q.y, q.z);
    });
    b.part(mergeGeometries(teeth)!, BONE, { bone, at: [0, 0, 0] });
  };

  const longBone = (a: THREE.Vector3, c: THREE.Vector3, r: number, bone: Joint) => {
    b.rod(a, c, r, BONE, { bone, sides: 6 });
    const d = c.clone().sub(a).normalize();
    const perp = new THREE.Vector3().crossVectors(d, v(0, 0, 1));
    if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0);
    perp.normalize().multiplyScalar(r);
    for (const e of [a, c])
      for (const sg of [1, -1]) blob(bone, e.clone().addScaledVector(perp, sg), r * 1.3, BONE, 6, 4);
  };

  const hang = (top: THREE.Vector3, feather: typeof FEATHER_RED, bone: Joint, len = 0.26) =>
    b.cards([frame(top, [0, 1, 0])], feather, { size: [0.07, len], lean: 180, flow: [0, 0, 1], bone, sink: 0.05 });

  const basisOf = (axis: THREE.Vector3) => {
    const a = axis.clone().normalize();
    const u = v(0, 0, 1).sub(a.clone().multiplyScalar(a.z)).normalize();
    return { a, u, w: a.clone().cross(u) };
  };

  // ---------------------------------------------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.15, -0.1], role: "spine" });
  const SP: Array<[number, number, number]> = [
    [0, 1.15, -0.1],
    [0, 1.42, 0.0],
    [0, 1.75, 0.1],
    [0, 2.0, 0.2],
    [0, 2.13, 0.36],
  ];
  const spine = b.chain("spine", catmull(SP), { parent: hips, role: "spine" });
  const sp3 = spine.joints[2];
  const sp4 = spine.joints[3];
  const neck = b.chain("neck", catmull([SP[4], [0, 2.17, 0.45], [0, 2.25, 0.58]]), {
    parent: sp4,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.25, 0.58],
    dir: [0, -0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.2, 0.7], aim: [0, 2.1, 1.02], role: "jaw", group: "head" });

  // ---------------------------------------------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: SP[0], w: 0.75, h: 0.55 },
      { at: SP[1], w: 1.0, h: 0.9 },
      { at: SP[2], w: 1.05, h: 0.8 },
      { at: SP[3], w: 1.3, h: 0.7 },
      { at: SP[4], w: 0.8, h: 0.55 },
    ],
    { bone: [hips, spine], color: SKIN },
  );
  const neckSw = b.sweep(neck, [0.26, 0.22, 0.2], { color: SKIN });
  const hump = blob(sp4, v(0, 2.05, 0.02), [0.5, 0.3, 0.4], SKIN, 10, 7);
  const torsoSurf = b.surface(torso);

  // ---------------------------------------------------------------------------------------------------- head
  const cranium = blob(head, v(0, 2.4, 0.6), [0.27, 0.25, 0.29], SKIN, 12, 9);
  blob(head, v(0, 2.25, 0.92), [0.21, 0.13, 0.22], SKIN, 10, 7); // snout
  blob(head, v(0, 2.18, 0.85), [0.19, 0.06, 0.2], LIP, 8, 5); // lip pad
  b.capsule(v(0, 2.45, 0.9), v(0, 2.33, 1.08), 0.05, SKIN, { bone: head, sides: 8 }); // nose bridge
  blob(head, v(0, 2.31, 1.12), [0.09, 0.065, 0.08], SKIN, 8, 6); // nose tip
  for (const s of [1, -1]) {
    blob(head, v(s * 0.065, 2.29, 1.1), [0.045, 0.04, 0.045], SKIN, 6, 4); // nostril wing
    blob(head, v(s * 0.04, 2.275, 1.165), [0.02, 0.016, 0.014], INK, 6, 4); // nostril
    blob(head, v(s * 0.2, 2.3, 0.78), [0.09, 0.075, 0.09], SKIN, 8, 6); // cheek
    // brow ridge: inner end low, outer end high for a scowl
    b.capsule(v(s * 0.04, 2.44, 0.9), v(s * 0.26, 2.5, 0.74), 0.065, SKIN, { bone: head, sides: 8 });
    // eye: dark socket, glowing eye with slit pupil, heavy lid
    blob(head, v(s * 0.13, 2.38, 0.84), 0.065, INK, 8, 6);
    glow(blob(head, v(s * 0.13, 2.375, 0.865), 0.042, EYE, 8, 6), 1.3);
    blob(head, v(s * 0.13, 2.375, 0.903), [0.007, 0.03, 0.006], INK, 4, 4);
    blob(head, v(s * 0.13, 2.41, 0.875), [0.058, 0.03, 0.052], SKIN, 8, 5);
    // ear and studs
    const ex = v(s * 0.7, 0.35, -0.62).normalize();
    const ey = v(0, 0.87, 0.5).normalize();
    const earOutline: OutlinePoint[] = [
      [0, -0.06],
      [0.12, -0.075],
      [0.3, -0.04],
      [0.52, 0.03, "sharp"],
      [0.3, 0.06],
      [0.12, 0.085],
      [0, 0.07],
    ];
    b.extrude(earOutline, {
      at: [s * 0.25, 2.42, 0.52],
      x: ex,
      y: ey,
      thickness: [0.045, 0.012],
      bevel: 0.008,
      color: EAR,
      bone: head,
    });
    for (const t of [0.12, 0.2, 0.28])
      blob(head, v(s * 0.25, 2.42, 0.52).addScaledVector(ex, t).addScaledVector(ey, -0.045), 0.016, GOLD, 6, 4);
  }
  b.part(new THREE.TorusGeometry(0.045, 0.009, 6, 12), GOLD, { bone: head, at: [0, 2.22, 1.15], dir: [1, 0, 0], axis: "z" });

  // mouth
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.3), MOUTH, { bone: head, at: [0, 2.17, 0.88] });
  b.sweep(
    catmull([
      [-0.19, 2.18, 0.78],
      [-0.15, 2.14, 1.0],
      [0, 2.14, 1.1],
      [0.15, 2.14, 1.0],
      [0.19, 2.18, 0.78],
    ]),
    0.035,
    LIP,
    { bone: head, sides: 6 },
  );
  for (const x of [-0.12, -0.06, 0.06, 0.12])
    b.spike(v(x, 2.15, 1.1 - 2.2 * x * x), [0, -1, 0], 0.055, 0.015, BONE, { bone: head, sides: 5 });

  // lower jaw, tusks
  b.sweep(
    catmull([
      [-0.22, 2.2, 0.68],
      [-0.19, 2.1, 0.88],
      [-0.09, 2.06, 1.04],
      [0, 2.05, 1.07],
      [0.09, 2.06, 1.04],
      [0.19, 2.1, 0.88],
      [0.22, 2.2, 0.68],
    ]),
    0.085,
    SKIN,
    { bone: jaw, sides: 8 },
  );
  blob(jaw, v(0, 2.1, 0.88), [0.17, 0.07, 0.2], SKIN, 8, 6);
  blob(jaw, v(0, 2.03, 1.05), [0.08, 0.06, 0.07], SKIN, 6, 5); // chin
  for (const s of [1, -1]) {
    const bez = bezier(v(s * 0.17, 2.08, 0.9), v(s * 0.23, 2.14, 0.98), v(s * 0.27, 2.3, 1.02), v(s * 0.24, 2.5, 0.98));
    b.sweep(bez, [0.045, 0], BONE, { bone: jaw, caps: { start: "flat", end: "point" }, sides: 7 });
    const t = 0.4;
    b.part(new THREE.TorusGeometry(0.034, 0.008, 5, 10), GOLD, { bone: jaw, at: bez.at(t), dir: bez.tangentAt(t), axis: "z" });
    // a few smaller lower teeth between the tusks
    for (const x of [0.06, 0.12]) b.spike(v(s * x, 2.12, 1.04 - 1.5 * x * x), [0, 1, 0.1], 0.05, 0.015, BONE, { bone: jaw, sides: 5 });
  }

  // ---------------------------------------------------------------------------------------------------- arms
  const shoulderParts: THREE.Mesh[] = [];
  const armJoints: Joint[][] = [];
  const armR = (t: number) =>
    0.19 -
    0.02 * Math.min(t / 0.48, 1) +
    0.035 * Math.sin(Math.PI * Math.min(Math.max((t - 0.48) / 0.52, 0), 1)) -
    0.06 * Math.max(0, (t - 0.8) / 0.2);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = v(s * 0.62, 2.0, 0.16);
    const wrist = v(s * 0.84, 0.88, 0.42);
    const pts = limb(sh, wrist, [0.62, 0.66], [0, 0, -1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: sp4,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const [shJ, elJ, wrJ] = arm.joints;
    armJoints.push(arm.joints);
    b.sweep(arm, armR, { color: SKIN });
    shoulderParts.push(blob(shJ, sh, [0.3, 0.27, 0.3], SKIN, 10, 7).mesh);
    blob(elJ, pts[1], 0.19, SKIN, 8, 6);
    b.spike(pts[1].clone().add(v(s * 0.06, 0, -0.14)), [s * 0.3, 0.2, -1], 0.15, 0.045, BONE, { bone: elJ, sides: 6 });

    // bicep band: rope with outward bone teeth
    const cpB = arm.at(0.2);
    const bandPts = ringAt(cpB, armR(0.2) + 0.015, 12);
    b.sweep(catmull(bandPts, { closed: true }), 0.028, HIDE, { bone: shJ, sides: 6 });
    ringAt(cpB, armR(0.2) + 0.02, 6).forEach((p) => {
      const out = p.clone().sub(cpB.at).normalize();
      b.spike(p, out, 0.07, 0.022, BONE, { bone: shJ, sides: 5 });
    });
    // wrist wraps
    for (const t of [0.84, 0.9]) {
      const cp = arm.at(t);
      b.sweep(catmull(ringAt(cp, armR(t) + 0.012, 10), { closed: true }), 0.026, t < 0.87 ? HIDE : CORD, {
        bone: elJ,
        sides: 6,
      });
    }

    // hand: palm, three fingers and a thumb as digit chains, claws
    blob(wrJ, wrist.clone().add(v(0, -0.1, 0.02)), [0.13, 0.13, 0.1], SKIN, 8, 6);
    blob(wrJ, wrist.clone().add(v(-s * 0.03, -0.03, 0.02)), 0.12, SKIN, 8, 6);
    [0.075, -0.005, -0.085].forEach((dz, k) => {
      const base = wrist.clone().add(v(0, -0.17, dz));
      const mid = base.clone().add(v(s * 0.01, -0.12, 0.03));
      const tip = mid.clone().add(v(s * 0.01, -0.11, 0.05));
      const ch = b.chain(`finger${k + 1}${side}`, [base, mid, tip], {
        parent: wrJ,
        names: [`finger${k + 1}${side}1`, `finger${k + 1}${side}2`],
        role: "digit",
      });
      b.sweep(ch, [0.046, 0.028], { color: SKIN });
      blob(ch.joints[0], base, 0.05, SKIN, 6, 4); // knuckle
      b.spike(tip, [0, -0.7, 0.7], 0.09, 0.028, CLAW, { bone: ch.joints[1], sides: 5 });
    });
    const tb = wrist.clone().add(v(-s * 0.09, -0.1, 0.07));
    const tm = tb.clone().add(v(-s * 0.04, -0.09, 0.05));
    const tt = tm.clone().add(v(-s * 0.0, -0.09, 0.07));
    const thumb = b.chain(`thumb${side}`, [tb, tm, tt], {
      parent: wrJ,
      names: [`thumb${side}1`, `thumb${side}2`],
      role: "digit",
    });
    b.sweep(thumb, [0.052, 0.03], { color: SKIN });
    b.spike(tt, [0, -0.6, 0.8], 0.09, 0.03, CLAW, { bone: thumb.joints[1], sides: 5 });

    // shoulder pauldron: hide dome with rim studs, bone spikes or a skull
    const C = v(s * 0.72, 2.12, 0.16);
    const axis = v(s * 0.55, 1, 0.05);
    const { a, u, w } = basisOf(axis);
    const dome: OutlinePoint[] = [
      [0, 0],
      [0.3, 0],
      [0.34, 0.04],
      [0.3, 0.14],
      [0.19, 0.22],
      [0, 0.255],
    ];
    b.lathe(dome, { at: C, axis, segments: 10, color: HIDE, bone: shJ, smoothing: 1 });
    const rim = Array.from({ length: 12 }, (_, i) => {
      const ang = (i / 12) * Math.PI * 2;
      return C.clone()
        .addScaledVector(u, Math.cos(ang) * 0.335)
        .addScaledVector(w, Math.sin(ang) * 0.335)
        .addScaledVector(a, 0.03);
    });
    b.sweep(catmull(rim, { closed: true }), 0.022, CORD, { bone: shJ, sides: 6 });
    rim.forEach((p, i) => {
      if (i % 2 === 0) blob(shJ, p.clone().addScaledVector(p.clone().sub(C).normalize(), 0.015), 0.02, GOLD, 6, 4);
    });
    if (s > 0) {
      skull(C.clone().addScaledVector(a, 0.36), 0.22, shJ, GLOWG);
      for (let i = 0; i < 4; i++) {
        const ang = Math.PI * (0.65 + 0.23 * i);
        const o = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
        b.spike(C.clone().addScaledVector(a, 0.15).addScaledVector(o, 0.2), a.clone().multiplyScalar(0.7).addScaledVector(o, 0.5), 0.2, 0.04, BONE, {
          bone: shJ,
          sides: 6,
        });
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const o = u.clone().multiplyScalar(Math.cos(ang)).addScaledVector(w, Math.sin(ang));
        b.spike(
          C.clone().addScaledVector(a, 0.2).addScaledVector(o, 0.15),
          a.clone().multiplyScalar(0.75).addScaledVector(o, 0.55),
          i % 2 ? 0.22 : 0.32,
          0.05,
          BONE,
          { bone: shJ, sides: 6 },
        );
      }
    }
  }

  // ---------------------------------------------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = v(s * 0.34, 1.1, -0.08);
    const pts = limb(hipP, v(s * 0.38, 0.2, 0.14), [0.56, 0.56], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.38, 0, 0.2],
    });
    const [hipJ, kneeJ, ankleJ] = leg.joints;
    b.sweep(leg, [0.23, 0.2, 0.165, 0.17, 0.14, 0.12], { color: SKIN });
    blob(hipJ, hipP, 0.22, SKIN, 8, 6);
    blob(kneeJ, pts[1].clone().add(v(0, 0, 0.04)), 0.18, SKIN, 8, 6);
    b.spike(pts[1].clone().add(v(s * 0.04, 0.04, 0.15)), [s * 0.3, 0.3, 1], 0.12, 0.04, BONE, { bone: kneeJ, sides: 6 });
    // shin wrap and anklet with hanging teeth
    const cpS = leg.at(0.55);
    b.sweep(catmull(ringAt(cpS, 0.172, 10), { closed: true }), 0.03, HIDE, { bone: kneeJ, sides: 6 });
    const cpA = leg.at(0.84);
    b.sweep(catmull(ringAt(cpA, 0.15, 10), { closed: true }), 0.022, CORD, { bone: ankleJ, sides: 6 });
    ringAt(cpA, 0.155, 6).forEach((p) => b.spike(p, [0, -1, 0], 0.06, 0.02, BONE, { bone: ankleJ, sides: 5 }));
    void hipJ;

    // foot: heel and ball as a capsule, arch, three toes with claws
    b.capsule(v(s * 0.38, 0.125, -0.05), v(s * 0.4, 0.115, 0.3), [0.135, 0.118], SKIN, { bone: ankleJ, sides: 8 });
    blob(ankleJ, v(s * 0.39, 0.2, 0.1), [0.13, 0.1, 0.18], SKIN, 8, 6);
    for (const d of [-0.095, 0, 0.095]) {
      const base = v(s * 0.4 + d, 0.1, 0.33);
      const tip = v(s * 0.4 + d * 1.25, 0.075, 0.5);
      b.capsule(base, tip, [0.062, 0.05], SKIN, { bone: ankleJ, sides: 6 });
      b.spike(tip, [d * 0.5, -0.25, 1], 0.09, 0.03, CLAW, { bone: ankleJ, sides: 5 });
    }
  }

  // ---------------------------------------------------------------------------------------------------- mohawk
  const hairSurf = b.surface([torso, hump, neckSw, cranium]);
  const zs = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, -0.1, -0.2];
  const ks = [0.7, 0.95, 1.1, 1.15, 1.1, 1.0, 0.95, 0.9, 0.85, 0.75, 0.6];
  zs.forEach((z, i) => {
    const hit = topAt(hairSurf, 0, z);
    if (!hit) return;
    const k = ks[i];
    const blade: OutlinePoint[] = [
      [-0.08 * k, 0],
      [0.08 * k, 0],
      [0.06 * k, 0.2 * k],
      [-0.1 * k, 0.46 * k, "sharp"],
      [-0.05 * k, 0.22 * k],
    ];
    b.extrude(blade, {
      at: hit.at,
      x: [0, 0.34, 0.94],
      y: [0, 0.94, -0.34],
      thickness: [0.05, 0.012],
      bevel: 0.008,
      color: MOHAWK,
      bone: hit.bone ?? sp4,
    });
  });

  // ---------------------------------------------------------------------------------------------------- belt, loincloth, belt fetishes
  const beltPath = torsoSurf.loop(v(0, 1.3, -0.05), { dir: [0, 1, 0], lift: 0.03 });
  b.sweep(beltPath, 0.045, HIDE, { bone: hips, sides: 8 });
  const beltSamples = Array.from({ length: 24 }, (_, i) => beltPath.at(i / 24));
  beltSamples.forEach((p, i) => {
    if (i % 2) return;
    const out = v(p.x, 0, p.z + 0.05).normalize();
    blob(hips, p.clone().addScaledVector(out, 0.045), 0.02, GOLD, 6, 4);
  });
  const front = beltSamples.reduce((a, c) => (c.z > a.z ? c : a));
  skull(front.clone().add(v(0, 0, 0.07)), 0.15, hips, GLOWG);
  const leftHip = beltSamples.reduce((a, c) => (c.x > a.x ? c : a));
  const rightHip = beltSamples.reduce((a, c) => (c.x < a.x ? c : a));

  const flapOutline: OutlinePoint[] = [
    [-0.25, 0],
    [0.25, 0],
    [0.27, -0.25],
    [0.2, -0.42],
    [0.1, -0.36],
    [0, -0.46, "sharp"],
    [-0.1, -0.36],
    [-0.2, -0.42],
    [-0.27, -0.25],
  ];
  const flapFront = torsoSurf.ray([0, 1.3, 2], [0, 0, -1]);
  if (flapFront)
    b.extrude(flapOutline, {
      at: flapFront.at.clone().add(v(0, 0.0, 0.1)),
      x: [1, 0, 0],
      y: [0, 1, -0.15],
      thickness: 0.03,
      bevel: 0.008,
      color: FLAP,
      bone: hips,
    });
  const flapBack = torsoSurf.ray([0, 1.3, -2], [0, 0, 1]);
  if (flapBack)
    b.extrude(flapOutline, {
      at: flapBack.at.clone().add(v(0, 0, -0.08)),
      x: [-1, 0, 0],
      y: [0, 1, 0.15],
      thickness: 0.03,
      bevel: 0.008,
      color: FLAP,
      bone: hips,
    });

  // left hip: bone bundle with skull, crossed bones, beads and feathers
  {
    const top = leftHip.clone().add(v(0.07, -0.03, 0.05));
    b.rod(top, top.clone().add(v(0, -0.36, 0)), 0.009, CORD, { bone: hips, sides: 5 });
    blob(hips, top.clone().add(v(0, -0.05, 0)), 0.022, GOLD, 6, 4);
    blob(hips, top.clone().add(v(0, -0.11, 0)), 0.022, BONE, 6, 4);
    longBone(top.clone().add(v(-0.1, -0.3, -0.03)), top.clone().add(v(0.1, -0.54, -0.03)), 0.011, hips);
    longBone(top.clone().add(v(0.1, -0.3, -0.03)), top.clone().add(v(-0.1, -0.54, -0.03)), 0.011, hips);
    skull(top.clone().add(v(0, -0.42, 0.02)), 0.11, hips, GLOWG);
    hang(top.clone().add(v(0.04, -0.14, 0)), FEATHER_RED, hips, 0.22);
    hang(top.clone().add(v(-0.04, -0.14, 0)), FEATHER_TEAL, hips, 0.2);
  }
  // right hip: hide pouch, tooth string and feathers
  {
    const top = rightHip.clone().add(v(-0.07, -0.03, 0.05));
    b.rod(top, top.clone().add(v(0, -0.14, 0)), 0.01, CORD, { bone: hips, sides: 5 });
    b.part(new THREE.BoxGeometry(0.15, 0.17, 0.09), HIDE, { bone: hips, at: top.clone().add(v(0, -0.22, 0)) });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.1), FLAP, { bone: hips, at: top.clone().add(v(0, -0.15, 0)) });
    blob(hips, top.clone().add(v(0, -0.15, 0.055)), 0.022, GOLD, 6, 4);
    for (let i = 0; i < 5; i++)
      b.spike(top.clone().add(v(-0.06 + i * 0.03, -0.31, 0.0)), [0, -1, 0], 0.06 + (i % 2) * 0.03, 0.016, BONE, {
        bone: hips,
        sides: 5,
      });
    hang(top.clone().add(v(0.05, -0.28, -0.03)), FEATHER_TEAL, hips, 0.24);
    hang(top.clone().add(v(-0.05, -0.28, -0.03)), FEATHER_RED, hips, 0.24);
    longBone(top.clone().add(v(0.12, -0.12, 0.0)), top.clone().add(v(0.14, -0.4, 0.0)), 0.011, hips);
  }

  // ---------------------------------------------------------------------------------------------------- chest: sigil, skull necklace
  const chestHit = torsoSurf.ray([0, 1.74, 2], [0, 0, -1]);
  if (chestHit) b.decal(torso, SIGIL, { at: chestHit, size: [0.55, 0.55] });

  const neckSurf = b.surface([torso, hump, neckSw]);
  const nPath = neckSurf.drape(
    catmull(
      [
        [0, 1.88, 0.6],
        [-0.22, 1.98, 0.58],
        [-0.38, 2.18, 0.42],
        [-0.3, 2.32, 0.2],
        [0, 2.38, 0.1],
        [0.3, 2.32, 0.2],
        [0.38, 2.18, 0.42],
        [0.22, 1.98, 0.58],
      ],
      { closed: true },
    ),
    { lift: 0.03 },
  );
  b.sweep(nPath, 0.02, CORD, { bone: sp4, sides: 6 });
  const pend: Array<{ p: THREE.Vector3 }> = [];
  for (let i = 0; i < 48; i++) {
    const p = nPath.at(i / 48);
    if (p.z > 0.3 && p.y < 2.12) pend.push({ p });
  }
  if (pend.length) {
    const low = pend.reduce((a, c) => (c.p.y < a.p.y ? c : a));
    b.rod(low.p, low.p.clone().add(v(0, -0.08, 0.02)), 0.01, CORD, { bone: sp4, sides: 5 });
    skull(low.p.clone().add(v(0, -0.14, 0.03)), 0.17, sp4, GLOWG);
    pend.forEach(({ p }, i) => {
      if (i % 2 || p.distanceTo(low.p) < 0.12) return;
      b.spike(p, [0, -1, 0], 0.08 + 0.02 * (i % 3), 0.016, BONE, { bone: sp4, sides: 5 });
    });
    for (const idx of [Math.floor(pend.length * 0.2), Math.floor(pend.length * 0.8)]) {
      const q = pend[idx].p;
      if (q.distanceTo(low.p) > 0.2) skull(q.clone().add(v(0, -0.08, 0.02)), 0.09, sp4, INK);
    }
  }

  // ---------------------------------------------------------------------------------------------------- back totem
  {
    const B0 = v(0.15, 1.5, -0.3);
    const T = v(0.28, 2.8, -0.75);
    b.rod(B0, T, [0.035, 0.028], WOOD, { bone: sp3, sides: 6 });
    const along = (t: number) => B0.clone().lerp(T, t);
    for (const t of [0.12, 0.2]) {
      const p = along(t);
      b.sweep(
        catmull(
          Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return p.clone().add(v(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05));
          }),
          { closed: true },
        ),
        0.014,
        CORD,
        { bone: sp3, sides: 5 },
      );
    }
    b.rod(along(0.3), v(0.4, 1.8, -0.08), 0.02, CORD, { bone: sp3, sides: 5 });
    skull(T.clone().add(v(0, 0.12, -0.02)), 0.24, sp3, GLOWG, true);
    for (const s of [1, -1])
      b.spike(T.clone().add(v(s * 0.1, 0.12, -0.02)), [s * 0.8, 0.8, 0.0], 0.2, 0.035, BONE, { bone: sp3, sides: 6 });
    const bar = along(0.8);
    longBone(bar.clone().add(v(-0.24, 0, 0)), bar.clone().add(v(0.24, 0, 0)), 0.014, sp3);
    for (const s of [1, -1]) {
      const end = bar.clone().add(v(s * 0.22, 0, 0));
      b.rod(end, end.clone().add(v(0, -0.1, 0)), 0.008, CORD, { bone: sp3, sides: 4 });
      skull(end.clone().add(v(0, -0.17, 0)), 0.1, sp3, INK, true);
    }
    hang(along(0.9).add(v(0.05, 0, 0)), FEATHER_RED, sp3, 0.32);
    hang(along(0.9).add(v(-0.05, 0, 0)), FEATHER_TEAL, sp3, 0.28);
    hang(along(0.93).add(v(0, 0, 0.04)), FEATHER_RED, sp3, 0.26);
  }

  // ---------------------------------------------------------------------------------------------------- swamp dressing: moss, mushrooms, warts
  {
    const humpHits = b.surface(hump).scatter(26, { rng: rand, minDist: 0.08, filter: (h) => h.n.y > 0.3 });
    b.cards(humpHits, MOSS, { size: [0.09, 0.12], lean: 20, bend: 25, cross: true, vary: 0.3, spin: 180, rng: rand });
    shoulderParts.forEach((m, i) => {
      const hits = b.surface(m).scatter(10, { rng: rand, minDist: 0.1, filter: (h) => h.n.y > 0.4 });
      b.cards(hits, MOSS, { size: [0.08, 0.1], lean: 15, bend: 20, cross: true, vary: 0.3, spin: 180, rng: rand });
      const joint = armJoints[i][0];
      const strands = b.surface(m).scatter(8, { rng: rand, minDist: 0.12, filter: (h) => h.n.y > 0.35 });
      b.cards(
        strands.map((h) => frame(h.at, [0, 1, 0])),
        STRAND,
        { size: [0.06, 0.22], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rand, bone: joint, sink: 0.05 },
      );
    });
    const hs = b.surface(hump);
    for (const [x, z, h] of [
      [0.3, -0.02, 0.09],
      [0.4, 0.04, 0.06],
      [-0.28, -0.06, 0.08],
    ] as const) {
      const hit = topAt(hs, x, z);
      if (!hit) continue;
      b.part(new THREE.CylinderGeometry(h * 0.12, h * 0.17, h, 6), STEM, { bone: sp4, at: hit.at.clone().add(v(0, h / 2 - 0.01, 0)) });
      b.part(new THREE.SphereGeometry(h * 0.5, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CAP, {
        bone: sp4,
        at: hit.at.clone().add(v(0, h * 0.95 - 0.01, 0)),
        scale: [1, 0.7, 1],
      });
    }
    const warts = b.surface([torso, hump, cranium]).scatter(30, { rng: rand, minDist: 0.12, filter: (h) => h.n.y > -0.2 });
    for (const hit of warts) b.stick(new THREE.SphereGeometry(0.022, 6, 4), WART, hit, { embed: 0.5 });
  }

  // snarl: open the jaw a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
