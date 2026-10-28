import * as THREE from "three";
import { createBuilder, frame, rng, limb, catmull, bezier, countershade, scales, paint, mix, smoothstep, noise, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "A jade-scaled qilin with a dragon head, branching gold antlers, whiskers, cloven golden hooves, flame fetlocks, an ox-style tail and a flowing cloud mane.",
};

const JADE = "#2fb59b", JADE2 = "#3fcbb0", JADE_D = "#176a6a", BELLY = "#f6e7b8";
const GOLD = "#f0b940", GOLD_D = "#a8741c", PEARL = "#bff6ff", RED = "#d9384a", DARK = "#1a1030";

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const A = (p: THREE.Vector3) => p.toArray() as [number, number, number];

  // ------------------------------------------------------------ textures
  const cloudTex = svg(
    `<svg viewBox="0 0 100 80">
      <defs><linearGradient id="c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9fd8f5"/><stop offset="0.6" stop-color="#f4fbff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
      <g fill="url(#c)" stroke="#e7a93a" stroke-width="2.5">
        <circle cx="30" cy="52" r="22"/><circle cx="58" cy="42" r="26"/><circle cx="78" cy="58" r="17"/><rect x="22" y="58" width="62" height="16" rx="8"/>
      </g>
      <path d="M30 50 q10 -14 22 -4 q8 8 -2 12 M60 40 q12 -10 20 2" stroke="#e7a93a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M50 70 q4 8 0 10 M60 72 q4 6 0 8" stroke="#ffffff" stroke-width="0" fill="none"/>
    </svg>`,
    { size: 192 },
  );
  const flameTex = svg(
    `<svg viewBox="0 0 40 64">
      <path d="M20 0 C28 18 38 28 34 46 C32 58 8 60 6 46 C4 34 14 26 20 0Z" fill="#ff5a2a"/>
      <path d="M20 14 C26 28 32 34 29 47 C27 56 12 56 11 47 C10 38 17 32 20 14Z" fill="#ffb02e"/>
      <path d="M20 32 C24 40 25 44 23 50 C21 54 16 54 15 50 C15 44 18 40 20 32Z" fill="#fff0a0"/>
    </svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg viewBox="0 0 64 48">
      <path d="M2 30 Q32 -6 62 24 Q34 50 2 30Z" fill="#1a1030"/>
      <ellipse cx="34" cy="26" rx="15" ry="17" fill="#ff9a2e"/>
      <ellipse cx="34" cy="20" rx="15" ry="9" fill="#d9384a"/>
      <ellipse cx="34" cy="27" rx="5" ry="11" fill="#1a1030"/>
      <circle cx="28" cy="19" r="5" fill="#fff"/><circle cx="40" cy="33" r="2.5" fill="#fff"/>
      <path d="M1 31 Q30 -9 63 22" stroke="#1a1030" stroke-width="4" fill="none"/>
      <path d="M58 20 L63 11" stroke="#1a1030" stroke-width="3.5"/>
    </svg>`,
    { size: 192 },
  );
  const emblemTex = svg(
    `<svg viewBox="0 0 80 80" fill="none" stroke="#ffd05a" stroke-width="4" stroke-linecap="round">
      <circle cx="40" cy="40" r="30"/>
      <path d="M40 14 C58 24 56 40 40 40 C24 40 22 56 40 66"/>
      <circle cx="40" cy="26" r="4" fill="#ffd05a"/><circle cx="40" cy="54" r="4" fill="#ffd05a"/>
    </svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------ paints
  const coat0 = countershade(scales([JADE, JADE2, "#27a58f"], JADE_D, { size: 0.05, width: 0.16 }), BELLY, { level: -0.3 });
  const coat = paint((p) => (p.y < 0.26 + 0.05 * noise(p, 0.08, 3) ? coat0 : coat0));
  const legPaint = paint((p, n) => {
    const base = coat0.at(p, n) as [number, number, number];
    return mix(base, "#f3c75a", smoothstep(0.42, 0.22, p.y));
  });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.05, -0.55], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.05, -0.55], [0, 1.08, -0.1], [0, 1.15, 0.3], [0, 1.2, 0.55]]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 1.3, 0.5], [0, 1.52, 0.72], [0, 1.78, 0.98]]), {
    parent: chest, role: "neck", names: ["neck1", "neck2"],
  });
  const P0 = neck.at(1).at.clone();
  const D = v(0, -0.3, 0.95).normalize();
  const U = v(0, 0.95, 0.3).normalize();
  const HS = 1.2;
  const hp = (f: number, u: number, x = 0) =>
    P0.clone().addScaledVector(D, f * HS).addScaledVector(U, u * HS).add(v(x * HS, 0, 0));
  const head = b.joint("head", { parent: neck.joints[1], at: P0, dir: A(D), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.08, -0.1), aim: hp(0.5, -0.12), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([[0, 1.1, -0.7], [0, 1.1, -1.0], [0, 0.95, -1.3], [0, 0.7, -1.45], [0, 0.45, -1.4]]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4"] },
  );

  // ------------------------------------------------------------ body
  const body = b.sweep(spine, (t) => [0.25 + 0.06 * Math.sin(t * 3), 0.3 + 0.08 * Math.sin(t * 3.2)], {
    color: coat, sides: 10, shift: [0, -0.03] as any, name: "body",
  });
  const neckTube = b.sweep(neck, (t) => [0.19 - 0.07 * t, 0.2 - 0.07 * t], { color: coat, sides: 8, name: "neck" });
  b.sweep(tail, (t) => 0.07 * (1 - t) + 0.025, { color: coat, sides: 6, name: "tailTube" });

  // ------------------------------------------------------------ head
  const st = (f: number, u: number, w: number, h: number) => ({ at: hp(f, u), w: w * HS, h: h * HS });
  const skull = b.loft([st(-0.1, 0, 0.22, 0.26), st(0.1, -0.01, 0.25, 0.28), st(0.3, -0.04, 0.2, 0.2), st(0.5, -0.06, 0.2, 0.15)], {
    bone: head, color: coat, sides: 8, smooth: false, name: "skull",
  });
  const jawT = b.loft([st(0.06, -0.15, 0.15, 0.1), st(0.3, -0.15, 0.13, 0.08), st(0.5, -0.13, 0.15, 0.07)], {
    bone: jaw, color: BELLY, sides: 6, smooth: false, name: "jaw",
  });
  for (const s of [1, -1]) {
    // eyes
    glow(
      b.decal(skull, eyeTex, {
        at: hp(0.15, 0.04, s * 0.1), dir: [s * 0.85, 0.2, 0.45], up: A(U), size: [0.14, 0.105], mirror: s < 0,
      }),
      0.5,
    );
    b.capsule(hp(0.05, 0.12, s * 0.09), hp(0.26, 0.1, s * 0.12), 0.018, { bone: head, color: JADE_D, sides: 5 }); // brow
    b.part(new THREE.IcosahedronGeometry(0.014, 0), DARK, { bone: head, at: hp(0.52, -0.02, s * 0.05), flat: true }); // nostril
    b.spike(hp(0.5, -0.1, s * 0.06), [0, -1, 0.1], 0.07, 0.014, { bone: head, color: "#fffaf0", sides: 5 }); // fang
    b.spike(hp(0.47, -0.12, s * 0.06), [0, 1, 0.1], 0.05, 0.012, { bone: jaw, color: "#fffaf0", sides: 5 });
    // ears
    b.spike(hp(-0.04, 0.12, s * 0.1), [s * 0.8, 0.5, -0.4], 0.17, 0.05, { bone: head, color: JADE, sides: 4 });
    b.spike(hp(-0.04, 0.12, s * 0.1), [s * 0.8, 0.5, -0.4], 0.12, 0.03, { bone: head, color: "#f5b3c4", sides: 4 });
    // whiskers
    for (const k of [0, 1]) {
      b.sweep(
        bezier(hp(0.46, -0.04 - k * 0.03, s * 0.08), hp(0.5, 0.0 - k * 0.1, s * 0.35), hp(0.2, -0.1 - k * 0.12, s * 0.55), hp(-0.2, -0.25 - k * 0.15, s * 0.6)),
        [0.009, 0.002], { bone: head, color: GOLD, sides: 4, caps: "point", name: "whisker" },
      );
    }
    // antlers
    const base = hp(-0.02, 0.15, s * 0.07);
    const pts = [base, base.clone().add(v(s * 0.03, 0.2, -0.1)), base.clone().add(v(s * 0.1, 0.42, -0.2)), base.clone().add(v(s * 0.08, 0.66, -0.16))];
    const main = catmull(pts);
    b.sweep(main, [0.032, 0.009], { bone: head, color: GOLD, sides: 6, caps: "point", name: "antler" });
    for (const [t, dx, dz, L] of [[0.3, 0.8, 0.2, 0.2], [0.55, 0.9, -0.5, 0.22], [0.78, -0.3, 0.8, 0.14]] as const) {
      const at = main.at(t);
      b.spike(at, [s * dx, 0.7, dz], L, 0.016, { bone: head, color: GOLD, sides: 5 });
    }
    b.part(new THREE.IcosahedronGeometry(0.03, 0), GOLD_D, { bone: head, at: base, flat: true });
  }
  // forehead pearl + horn
  const pearl = b.part(new THREE.OctahedronGeometry(0.035, 0), PEARL, { bone: head, at: hp(0.12, 0.17), flat: true });
  glow(pearl, 1.4);
  b.part(new THREE.OctahedronGeometry(0.048, 0), GOLD, { bone: head, at: hp(0.12, 0.165), flat: true });
  // beard
  b.cards([0.2, 0.32, 0.44].map((f) => frame(hp(f, -0.2), [0, -1, 0])), cloudTex, { size: [0.1, 0.12], lean: 150, flow: [0, 0, -1], bone: jaw, color: "#ffffff" });

  // ------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const root: [number, number, number] = front ? [s * 0.2, 1.0, 0.45] : [s * 0.21, 1.0, -0.55];
      const foot: [number, number, number] = front ? [s * 0.19, 0.07, 0.52] : [s * 0.19, 0.07, -0.7];
      const pts = limb(root, foot, front ? [0.42, 0.4, 0.28] : [0.45, 0.42, 0.28], front ? [[0, 0, -1], [0, 0, 1]] : [[0, 0, 1], [0, 0, -1]]);
      const tag = (front ? "F" : "H") + k;
      const leg = b.chain(`leg${tag}`, pts, {
        parent: front ? chest : hips, role: "leg",
        names: [`hip${tag}`, `knee${tag}`, `fetlock${tag}`, `hoof${tag}`], contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, (t) => [0.1 * (1 - t) + 0.045, 0.1 * (1 - t) + 0.045], { color: legPaint, sides: 6, smooth: false, name: `leg${tag}` });
      const mass = leg.joints[0];
      b.part(new THREE.IcosahedronGeometry(0.15, 1), coat, { bone: mass, at: mass.at.clone().add(v(0, -0.06, 0)), scale: [0.85, 1.2, 1.1], flat: true });
      const tip = leg.tip!;
      for (const h of [-1, 1])
        b.part(new THREE.BoxGeometry(0.05, 0.1, 0.11), GOLD, { bone: tip, at: [foot[0] + h * 0.028, 0.05, foot[2] + 0.01] });
      b.part(new THREE.CylinderGeometry(0.06, 0.064, 0.025, 6), GOLD_D, { bone: tip, at: [foot[0], 0.11, foot[2]], flat: true });
      glow(
        b.cards(
          [0, 1, 2].map((i) => frame([foot[0] + (i - 1) * 0.04, 0.17, foot[2]], [0, 1, 0])),
          flameTex, { size: [0.09, 0.2], lean: 25, flow: [0, 0, -1], bone: tip, bend: 20 },
        ),
        1,
      );
    }
  }

  // ------------------------------------------------------------ cloud mane, tail, emblem
  const maneFrames = [];
  for (let i = 0; i < 9; i++) for (const a of [-35, 0, 35]) maneFrames.push(neckTube.at(0.04 + i * 0.115, a));
  b.cards(maneFrames, cloudTex, { size: [0.3, 0.24], lean: 55, bend: 20, flow: [0, -0.3, -1], vary: 0.25, rng: rng(3), spin: 15, color: "#ffffff" });
  const back = [];
  for (let i = 0; i < 6; i++) back.push(body.at(0.1 + i * 0.15, 0));
  b.cards(back, cloudTex, { size: [0.22, 0.18], lean: 60, flow: [0, -0.2, -1], vary: 0.2, rng: rng(5), color: "#ffffff" });
  b.cards([0.65, 0.8, 0.95].map((t) => tail.at(t)), cloudTex, { size: [0.3, 0.26], lean: 70, flow: [0, -0.4, -1], cross: true, rng: rng(6), color: "#ffffff" });
  glow(
    b.cards([0.75, 0.9, 1].map((t) => tail.at(t)), flameTex, { size: [0.14, 0.34], lean: 50, flow: [0, -0.5, -1], cross: true, bend: 25 }),
    1,
  );
  for (const s of [1, -1])
    b.decal(body, emblemTex, { at: [s * 0.3, 1.1, 0.0], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s < 0 });

  // golden collar with ornaments
  const collar = b.surface(neckTube).loop(neck.at(0.2), { lift: 0.012 });
  b.sweep(collar, 0.02, { color: GOLD, sides: 4, bone: neck.joints[0], name: "collar" });
  b.along(collar, 10, (at) => b.part(new THREE.IcosahedronGeometry(0.016, 0), RED, { at, bone: neck.joints[0], flat: true }));

  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });
  return b.root;
}
