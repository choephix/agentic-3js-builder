import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import type { FrameInput } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { paint, scales } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled hooved chimera with a dragon head, gold antlers, cloud mane and ox tail, cel-shaded anime fantasy with gold filigree and glowing gems.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const GOLD = "#f2bd45";
const GOLD_D = "#b8801f";
const GOLD_L = "#ffe9a6";
const IVORY = "#fff7e3";
const GLOW = "#5ff5e0";
const HOOF = "#7a4b2a";
const NOSE = "#3a6f78";
const CORAL = "#e8505b";
const FIN = "#6fe3cf";
const FIN_D = "#2fae9d";

const SCALE_JADE = scales(["#3fcfb2", "#34bfa6", "#4ad8b8"], "#1b7a6c", { size: 0.055, width: 0.14, seed: 3 });
const SCALE_BELLY = scales(["#fff2c6", "#ffe9ae"], "#d8b25e", { size: 0.055, width: 0.12, seed: 5 });
const SCALE_GOLD = scales(["#f6c75a", "#ffd774"], "#a8741a", { size: 0.04, width: 0.14, seed: 7 });
const COAT = cel(furEdge(SCALE_JADE, SCALE_BELLY, { level: -0.3, teeth: 0.3, period: 0.04, ink: "#1d6a5e" }));
const SOCK = cel(SCALE_GOLD);
const LEG = paint((p) => (p.y < 0.34 + 0.035 * zigzag((p.x + p.z) / 0.05) ? SOCK : COAT));

// ---------------------------------------------------------------- drawings
function cloud(main: string, light: string, dark: string, swirl: string) {
  const bumps = [
    [32, 76, 19],
    [18, 60, 14],
    [46, 58, 15],
    [27, 42, 12],
    [42, 32, 10],
    [34, 18, 8],
    [38, 7, 4.5],
  ];
  const under = bumps.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 2.2}" fill="${dark}"/>`).join("");
  const body = bumps.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${main}"/>`).join("");
  const hi = bumps.map(([x, y, r]) => `<circle cx="${x - 3}" cy="${y - 3}" r="${r * 0.45}" fill="${light}"/>`).join("");
  return svg(
    `<svg viewBox="0 0 64 96">${under}${body}${hi}
    <path d="M26 72 q6 -12 14 -4 q4 6 -4 9" stroke="${swirl}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M24 46 q6 -8 12 -2 q2 5 -4 6" stroke="${swirl}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}
const CLOUD_A = cloud("#e9fbff", "#ffffff", "#2a8fa8", "#7fe3e0");
const CLOUD_B = cloud("#ffe3a0", "#fff6d8", "#d19a3a", "#ffcf6a");
const CLOUD_C = cloud("#5fdcc4", "#b9fbe8", "#1f8f86", "#e8fff8");

const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 60 C20 40 45 35 52 50 C58 62 45 72 38 65 C32 58 40 50 46 55" stroke="#8a5a10" stroke-width="9"/>
  <path d="M52 50 C65 40 80 45 85 60 C80 52 70 55 66 62" stroke="#8a5a10" stroke-width="9"/>
  <path d="M20 60 C20 40 45 35 52 50 C58 62 45 72 38 65 C32 58 40 50 46 55" stroke="#ffd36a" stroke-width="4.5"/>
  <path d="M52 50 C65 40 80 45 85 60 C80 52 70 55 66 62" stroke="#ffd36a" stroke-width="4.5"/>
  </g>
  <circle cx="46" cy="55" r="4" fill="#fff0b8"/><circle cx="66" cy="62" r="3.5" fill="#fff0b8"/>
  </svg>`,
  { size: 256 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 32 64">
  <rect x="11" y="0" width="10" height="9" rx="3" fill="#f2bd45" stroke="#8a5a10" stroke-width="1.5"/>
  <g stroke="#b8303c" stroke-width="3.2" stroke-linecap="round">
  <path d="M12 9 L7 60"/><path d="M16 9 L16 62"/><path d="M20 9 L25 60"/><path d="M14 9 L11 62"/><path d="M18 9 L21 62"/>
  </g>
  <g stroke="#ff7a85" stroke-width="1.4" stroke-linecap="round"><path d="M16 12 L16 58"/><path d="M12 12 L9 56"/></g>
  </svg>`,
  { size: 128 },
);

const EYE = animeEye({ iris: "#ffae2b" });

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const rand = rng(11);
  const clouds = [CLOUD_A, CLOUD_A, CLOUD_C, CLOUD_B];

  // ---------------------------------------------------------------- skeleton: spine, neck, tail
  const hips = b.joint("hips", { at: [0, 1.2, -0.6] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, -0.78],
      [0, 1.2, -0.3],
      [0, 1.26, 0.2],
      [0, 1.32, 0.62],
    ]),
    { parent: hips, count: 4, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const body = b.sweep(
    spine,
    (t) => [0.19 + 0.1 * Math.sin(Math.PI * t), 0.24 + 0.05 * t + 0.06 * Math.sin(Math.PI * t)],
    { color: COAT, name: "body" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.32, 0.56],
      [0, 1.5, 0.74],
      [0, 1.7, 0.9],
    ]),
    { parent: chest, count: 3, role: "neck" },
  );
  const neckTube = b.sweep(neck, (t) => [0.2 - 0.07 * t, 0.21 - 0.08 * t], { color: COAT, name: "neck" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.22, -0.8],
      [0, 1.38, -1.0],
      [0, 1.36, -1.28],
      [0, 1.15, -1.5],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.085, 0.035], { color: COAT, name: "tail" });

  // ---------------------------------------------------------------- head
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.2, 1], group: "head", role: "head" });
  const hl = (s: number, l: number, u: number, f: number) => {
    const o: { left?: number; right?: number; up?: number; down?: number; forward?: number; back?: number } = {};
    const x = s * l;
    if (x >= 0) o.left = x;
    else o.right = -x;
    if (u >= 0) o.up = u;
    else o.down = -u;
    if (f >= 0) o.forward = f;
    else o.back = -f;
    return head.local(o);
  };
  const C = hl(1, 0, 0, 0.1);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), COAT, {
    bone: head,
    at: C,
    scale: [0.115, 0.105, 0.135],
    name: "skull",
  });
  b.sweep([hl(1, 0, -0.01, 0.12), hl(1, 0, -0.04, 0.3), hl(1, 0, -0.06, 0.43)], (t) => [0.095 - 0.02 * t, 0.075 - 0.015 * t], {
    bone: head,
    color: COAT,
    sides: 8,
    name: "snout",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hl(1, 0, -0.065, 0.45),
    scale: [0.075, 0.055, 0.06],
    name: "nosePad",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), INK, { bone: head, at: hl(s, 0.04, -0.05, 0.5), name: "nostril" });
    // fangs
    b.spike(hl(s, 0.05, -0.095, 0.38), [0, -1, 0.15], 0.055, 0.011, IVORY, { bone: head, sides: 6 });
    // cheek fins
    const fin = (scale: number, at: THREE.Vector3, color: string) => {
      const pts: OutlinePoint[] = (
        [
          [0, 0.03],
          [0.07, 0.09],
          [0.16, 0.1, "sharp"],
          [0.1, 0.04],
          [0.2, -0.02, "sharp"],
          [0.08, -0.04],
          [0, -0.04],
        ] as OutlinePoint[]
      ).map((q) => (q.length === 3 ? [q[0] * scale, q[1] * scale, "sharp"] : [q[0] * scale, q[1] * scale]) as OutlinePoint);
      b.extrude(pts, { at, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color, bone: head });
    };
    fin(1.2, hl(s, 0.11, 0.0, 0.0), FIN);
    fin(0.8, hl(s, 0.115, 0.07, 0.02), GOLD);
    fin(0.9, hl(s, 0.1, -0.06, 0.0), FIN_D);
  }

  // jaw
  const jaw = b.joint("jaw", {
    parent: head,
    at: hl(1, 0, -0.07, 0.06),
    aim: hl(1, 0, -0.1, 0.4),
    role: "jaw",
  });
  b.sweep([hl(1, 0, -0.105, 0.08), hl(1, 0, -0.12, 0.26), hl(1, 0, -0.12, 0.42)], (t) => [0.075 - 0.025 * t, 0.035], {
    bone: jaw,
    color: COAT,
    sides: 8,
    name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    b.spike(hl(s, 0.045, -0.095, 0.39), [0, 1, 0.1], 0.045, 0.009, IVORY, { bone: jaw, sides: 6 });
  }
  // gold beard tufts hanging from chin
  b.cards(
    [0.2, 0.3, 0.38].map((f) => frame(hl(1, 0, -0.14, f), [0, 1, 0])),
    CLOUD_B,
    { size: [0.07, 0.16], lean: 180, flow: [0, 0, 1], cross: true, bone: jaw },
  );

  // eyes, brow horns, gem
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = skin.around(C).at(s * 52, 6);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.058, 0.08], mirror: s > 0 });
    const brow = skin.around(C).at(s * 40, 38);
    if (brow) b.spike(brow, [s * 0.5, 0.3, -0.8], 0.15, 0.022, GOLD, { bone: head, sides: 6 });
  }
  const gemHit = skin.around(C).at(0, 62);
  if (gemHit) {
    b.stick(new THREE.CylinderGeometry(0.04, 0.045, 0.02, 6), GOLD, gemHit, { embed: 0.5, bone: head });
    glow(b.stick(new THREE.OctahedronGeometry(0.03), GLOW, gemHit, { embed: 0.2, bone: head }), 1.5);
  }
  const crown = [0, 20, -20]
    .map((az) => skin.around(C).at(az, 78))
    .filter((h): h is NonNullable<typeof h> => h !== null);
  b.cards(crown, [CLOUD_A, CLOUD_B], { size: [0.1, 0.14], lean: 40, bend: 30, cross: true, bone: head, rng: rand });

  // whiskers
  for (const s of [1, -1]) {
    for (const k of [0, 1]) {
      const pts = [
        hl(s, 0.07, -0.05 - 0.04 * k, 0.42),
        hl(s, 0.25, 0.0 - 0.05 * k, 0.45),
        hl(s, 0.4, -0.1 - 0.05 * k, 0.3),
        hl(s, 0.5 - 0.05 * k, -0.3 - 0.05 * k, 0.05),
      ];
      b.sweep(catmull(pts), [0.011, 0.004], {
        bone: head,
        color: GOLD,
        bands: [[0.8, GOLD]],
        caps: { start: "round", end: "point" },
        sides: 6,
        name: "whisker",
      });
      if (k === 0) glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), GLOW, { bone: head, at: pts[3] }), 1.3);
    }
  }

  // antlers
  for (const s of [1, -1]) {
    const beamPts = [
      hl(s, 0.055, 0.085, 0.06),
      hl(s, 0.075, 0.22, 0.02),
      hl(s, 0.11, 0.38, -0.08),
      hl(s, 0.13, 0.52, -0.24),
      hl(s, 0.11, 0.62, -0.42),
    ];
    const beam = catmull(beamPts);
    b.sweep(beam, [0.034, 0.012], {
      bone: head,
      color: GOLD,
      bands: [
        [0.15, GOLD_D],
        [0.6, GOLD],
        [0.9, GOLD_L],
      ],
      caps: { start: "flat", end: "point" },
      sides: 8,
      name: "antler",
    });
    glow(b.part(new THREE.IcosahedronGeometry(0.018, 0), GLOW, { bone: head, at: beam.at(1) }), 1.4);
    b.along(
      beam,
      5,
      (at) => {
        const rr = 0.034 - 0.022 * at.t + 0.007;
        b.part(new THREE.CylinderGeometry(rr, rr, 0.01, 8), GOLD_L, { frame: at, bone: head, name: "antlerRing" });
      },
      {},
    );
    const tines: Array<[number, number[], number]> = [
      [0.3, [s * 0.7, 0.5, 0.4], 0.2],
      [0.5, [s * 0.6, 0.7, -0.3], 0.22],
      [0.72, [s * 0.5, 0.6, -0.5], 0.18],
    ];
    for (const [t, dv, len] of tines) {
      const base = beam.at(t);
      const d = new THREE.Vector3(dv[0], dv[1], dv[2]).normalize();
      const tip = base.clone().addScaledVector(d, len);
      const midp = base.clone().addScaledVector(d, len * 0.5).add(new THREE.Vector3(0, 0.03, -0.02));
      b.sweep(catmull([base, midp, tip]), [0.018, 0.004], {
        bone: head,
        color: GOLD,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: "tine",
      });
      glow(b.part(new THREE.IcosahedronGeometry(0.013, 0), GLOW, { bone: head, at: tip }), 1.3);
    }
  }

  // ---------------------------------------------------------------- legs
  const makeLeg = (tag: string, S: string, pts: THREE.Vector3[], parent: Joint, radii: number[], names: string[]) => {
    const ch = b.chain(`leg${tag}${S}`, pts, { parent, names, role: "leg" });
    const tube = b.sweep(ch, radii, { color: LEG, name: `leg${tag}${S}` });
    const tip = ch.joints[ch.joints.length - 1];
    const P = pts[pts.length - 1];
    for (const t of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(0.03, 0.042, 0.085, 6), HOOF, {
        bone: tip,
        at: [P.x + t * 0.028, 0.0425, P.z + 0.025],
        name: "toe",
      });
    }
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 8), GOLD, { bone: tip, at: [P.x, 0.105, P.z], name: "coronet" });
    const loop = b.surface(tube).loop(ch.at(0.82), { lift: 0.004 });
    b.sweep(loop, 0.012, GOLD_L, { name: "anklet" });
    const puffs: FrameInput[] = [];
    for (const ang of [45, 135, 225, 315]) puffs.push(tube.at(0.62, ang));
    b.cards(puffs, [CLOUD_A, CLOUD_B], { size: [0.09, 0.13], lean: 60, bend: 25, cross: true, rng: rand, vary: 0.2 });
    return ch;
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hp = limb(
      [s * 0.17, 1.08, -0.6],
      [s * 0.18, 0.05, -0.72],
      [0.4, 0.4, 0.3],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = makeLeg("H", S, hp, hips, [0.12, 0.075, 0.05, 0.04, 0.034], [
      `hipH${S}`,
      `kneeH${S}`,
      `hockH${S}`,
      `hoofH${S}`,
    ]);
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: hind.joints[0],
      at: [s * 0.2, 1.0, -0.62],
      scale: [0.12, 0.24, 0.2],
      name: "thigh",
    });
    const fp = limb(
      [s * 0.17, 1.12, 0.5],
      [s * 0.18, 0.05, 0.55],
      [0.46, 0.42, 0.3],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fore = makeLeg("F", S, fp, chest, [0.1, 0.065, 0.045, 0.036, 0.032], [
      `shoulderF${S}`,
      `elbowF${S}`,
      `carpusF${S}`,
      `hoofF${S}`,
    ]);
    b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
      bone: fore.joints[0],
      at: [s * 0.2, 1.1, 0.52],
      scale: [0.11, 0.2, 0.18],
      name: "shoulder",
    });
  }

  // ---------------------------------------------------------------- body decals
  for (const s of [1, -1]) {
    b.decal(body, SWIRL, { at: [s * 0.3, 1.2, 0.0], dir: [s, 0, 0], size: [0.32, 0.32], mirror: s < 0 });
    b.decal(body, SWIRL, { at: [s * 0.3, 1.12, -0.55], dir: [s, 0, 0], size: [0.24, 0.24], mirror: s < 0 });
  }

  // ---------------------------------------------------------------- cloud mane
  const neckRows: Array<[number, number, number]> = [
    [0, 0.2, 0.26],
    [-40, 0.17, 0.22],
    [40, 0.17, 0.22],
    [-120, 0.12, 0.17],
    [120, 0.12, 0.17],
  ];
  for (const [ang, w, h] of neckRows) {
    const frames: FrameInput[] = [];
    for (let i = 0; i < 13; i++) frames.push(neckTube.at(0.04 + i * 0.075, ang));
    b.cards(frames, clouds, { size: [w, h], lean: 55, bend: 30, cross: true, rng: rand, vary: 0.25, spin: 15 });
  }
  const dorsal: FrameInput[] = [];
  b.along(
    body,
    8,
    (at) => {
      dorsal.push(at);
    },
    { from: 0.35, to: 0.95 },
  );
  b.cards(dorsal, clouds, { size: [0.17, 0.22], lean: 50, bend: 30, cross: true, rng: rand, vary: 0.25 });

  // tail tufts
  b.cards(b.ring(tail.at(1), { count: 9, radius: 0.02 }).items, clouds, {
    size: [0.16, 0.42],
    lean: 50,
    bend: 40,
    cross: true,
    rng: rand,
    vary: 0.2,
  });
  b.cards(b.ring(tail.at(0.85), { count: 6, radius: 0.03 }).items, [CLOUD_A, CLOUD_B], {
    size: [0.12, 0.28],
    lean: 55,
    bend: 35,
    cross: true,
    rng: rand,
  });
  const tailRidge: FrameInput[] = [];
  b.along(
    tailTube,
    5,
    (at) => {
      tailRidge.push(at);
    },
    {},
  );
  b.cards(tailRidge, clouds, { size: [0.12, 0.16], lean: 55, bend: 25, cross: true, rng: rand });

  // ---------------------------------------------------------------- collar and pendant
  const collar = b.surface(neckTube).loop(neck.at(0.42), { lift: 0.012 });
  b.sweep(collar, 0.018, GOLD, { name: "collar" });
  const pt = neckTube.at(0.42, 180, 0.015);
  b.stick(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 8), GOLD, pt, { embed: 0.5, bone: neck.joints[1] });
  glow(b.stick(new THREE.OctahedronGeometry(0.035), GLOW, pt, { embed: 0.2, bone: neck.joints[1] }), 1.5);
  for (const i of [-1, 0, 1]) {
    const base = pt.at.clone().add(new THREE.Vector3(i * 0.035, -0.05, 0.02));
    const end = base.clone().add(new THREE.Vector3(0, -0.1 - (i === 0 ? 0.04 : 0), 0));
    b.rod(base, end, 0.006, CORAL, { bone: neck.joints[1] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: neck.joints[1], at: end });
    b.cards([frame(end, [0, 1, 0])], TASSEL, {
      size: [0.04, 0.12],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: neck.joints[1],
    });
  }

  return b.root;
}
