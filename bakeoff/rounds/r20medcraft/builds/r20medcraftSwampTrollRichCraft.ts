import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Part } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, heavy-shouldered swamp troll with underbite tusks, a flame-coloured mohawk and a trophy of bone fetishes: tooth necklace, skull belt, hip bundle and a skull totem on his back. Hand-painted mossy skin, studded leather and gold trim.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type P3 = [number, number, number];
type Col = string | Paint;

// ---- palette -------------------------------------------------------------------------------------------------
const SK_MID = "#4f9a73";
const SK_DARK = "#2e6a57";
const SK_LIGHT = "#8dcf88";
const SK_SHADE = "#2b4f5e";
const BELLY = "#b9cc8c";
const MOSS = "#6f9f3a";
const MUD = "#4a3b26";
const BONE = "#e8dcb8";
const BONE_D = "#b9a87c";
const LEATHER = "#7a4a2a";
const LEATHER_D = "#47281a";
const LEATHER_L = "#a9693a";
const RED = "#c9381f";
const ORANGE = "#f2802a";
const YELLOW = "#ffd24a";
const EYE = "#ffe53a";
const DARK = "#1b1410";
const MOUTH = "#6b1f2a";
const GOLD = "#dba72e";
const TEAL = "#2fa3a0";
const WART = "#3d7a4d";
const CLAW = "#2a2217";
const WOOD = "#5a3d22";
const SOCKET = "#1e3a2c";

// ---- paints --------------------------------------------------------------------------------------------------
const SKIN = paint((p, n) => {
  const t = noise(p, 0.2, 5);
  let c = mix(SK_MID, SK_DARK, smoothstep(0.4, 0.75, t) * 0.85);
  c = mix(c, SK_LIGHT, smoothstep(0.15, 0.95, n.y) * 0.6);
  c = mix(c, SK_SHADE, smoothstep(-0.1, -0.9, n.y) * 0.6);
  const belly = smoothstep(0.35, 0.9, n.z) * smoothstep(1.7, 1.4, p.y) * smoothstep(0.85, 1.05, p.y) * smoothstep(0.5, 0.3, Math.abs(p.x));
  c = mix(c, BELLY, belly * 0.75);
  c = mix(c, MOSS, smoothstep(0.55, 0.75, n.y) * smoothstep(0.52, 0.66, noise(p, 0.09, 9)) * 0.85);
  const mud = smoothstep(0.35, 0.04, p.y) * (0.55 + 0.4 * noise(p, 0.07, 4));
  return mix(c, MUD, Math.min(mud, 0.95));
});

const BONE_P = paint((p, n) => mix(mix(BONE, BONE_D, noise(p, 0.05, 2) * 0.8), "#fff7de", smoothstep(0.3, 1, n.y) * 0.4));
const TUSK = paint((_p, _n, s) => mix(BONE_D, "#fff4d6", smoothstep(0, 0.9, s[0])));
const LEATHER_P = paint((p, n) =>
  mix(mix(LEATHER, LEATHER_D, noise(p, 0.04, 7) * 0.9), LEATHER_L, smoothstep(0.3, 1, n.y) * 0.5),
);
const MOHAWK = paint((_p, _n, s) => (s[1] > 0.24 ? YELLOW : s[1] > 0.14 ? ORANGE : RED));
const CLOTH = paint((p, n, s) => {
  if (Math.abs(n.z) < 0.5) return LEATHER_D;
  if (s[1] > -0.09) return RED;
  if (s[1] > -0.12) return GOLD;
  const c = mix(LEATHER, LEATHER_D, noise(p, 0.05, 3));
  return mix(c, LEATHER_L, smoothstep(-0.15, -0.3, s[1]) * 0.35);
});

const WARPAINT = svg(
  `<svg viewBox="0 0 100 130"><g fill="none" stroke="#efe6c8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 12 L50 56 L84 12"/><path d="M28 12 L50 40 L72 12"/>
  <circle cx="50" cy="82" r="11"/><circle cx="50" cy="82" r="3" fill="#efe6c8"/>
  <path d="M14 104 L28 124 M36 104 L50 124 M64 104 L72 124 M86 104 L84 124"/>
  <path d="M10 70 Q22 60 30 72 M90 70 Q78 60 70 72"/></g></svg>`,
  { size: 256 },
);

const blade = (h: number, w: number): OutlinePoint[] => [
  [-w, 0],
  [w, 0],
  [w * 0.85, h * 0.42],
  [w * 0.3, h, "sharp"],
  [-w * 0.2, h * 0.72],
  [-w * 0.9, h * 0.4],
];

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const random = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---- skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.0, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.0, -0.02],
      [0, 1.28, 0.04],
      [0, 1.56, 0.12],
      [0, 1.82, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const [sp1, sp2, chest] = spine.joints;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.82, 0.22],
      [0, 1.9, 0.3],
      [0, 1.95, 0.38],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.95, 0.38], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.9, 0.45], aim: [0, 1.78, 0.72], role: "jaw" });

  const ell = (c: P3, r: P3, color: Col, bone: Joint) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), color, { bone, at: c, scale: r });

  // ---- torso --------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.98, -0.02], w: 0.56, h: 0.42 },
      { at: [0, 1.2, 0.03], w: 0.62, h: 0.5 },
      { at: [0, 1.48, 0.1], w: 0.84, h: 0.56 },
      { at: [0, 1.7, 0.16], w: 1.0, h: 0.5 },
      { at: [0, 1.84, 0.22], w: 0.55, h: 0.4 },
    ],
    { bone: spine, color: SKIN },
  );
  ell([0, 1.0, 0], [0.27, 0.19, 0.21], SKIN, hips);
  const belly = ell([0, 1.25, 0.27], [0.29, 0.22, 0.2], SKIN, sp1);
  const hump = ell([0, 1.84, 0.08], [0.38, 0.2, 0.26], SKIN, chest);
  const pecs: Part[] = [];
  for (const s of [1, -1]) pecs.push(ell([s * 0.22, 1.58, 0.4], [0.22, 0.18, 0.16], SKIN, chest));
  const neckSweep = b.sweep(neck, [0.21, 0.2, 0.19], { color: SKIN });
  const skinB = b.surface([torso, hump, belly, ...pecs, neckSweep]);

  b.decal(skinB, WARPAINT, { at: [0, 1.42, 0.52], dir: [0, 0, 1], size: [0.42, 0.55] });

  for (const hit of skinB.scatter(14, { rng: rng(5), minDist: 0.16, filter: (h) => h.n.z > -0.2 }))
    b.stick(sph(0.03, 6, 4), WART, hit, { embed: 0.5 });

  // belt with skull buckle
  const beltLoop = b.surface(torso).loop([0, 0.97, 0], { dir: [0, 1, 0], lift: 0.03 });
  b.sweep(beltLoop, 0.04, { color: LEATHER_P, bone: hips });
  b.along(beltLoop, 14, (at) => b.part(sph(0.02, 5, 4), GOLD, { at: at.at, bone: hips }));

  // loincloth
  const flapOutline: OutlinePoint[] = [
    [-0.2, 0],
    [0.2, 0],
    [0.23, -0.4],
    [0.12, -0.5],
    [0, -0.42],
    [-0.12, -0.5],
    [-0.23, -0.4],
  ];
  for (const z of [0.235, -0.235])
    b.extrude(flapOutline, { at: [0, 0.99, z], x: [1, 0, 0], thickness: 0.03, color: CLOTH, bone: hips });
  for (const [fx, fy] of [
    [-0.23, -0.4],
    [-0.12, -0.5],
    [0, -0.42],
    [0.12, -0.5],
    [0.23, -0.4],
  ])
    b.spike([fx, 0.99 + fy, 0.25], [0, -1, 0], 0.08, 0.02, { color: BONE_P, bone: hips });

  // ---- helpers for fetishes -----------------------------------------------------------------------------------
  const skull = (at: P3, dir: P3, sc: number, bone: Joint) => {
    const q = aim(dir, undefined, "z");
    const put = (off: P3, geo: THREE.BufferGeometry, color: Col) => {
      const o = new THREE.Vector3(off[0], off[1], off[2])
        .multiplyScalar(sc)
        .applyQuaternion(q)
        .add(new THREE.Vector3(at[0], at[1], at[2]));
      return b.part(geo, color, { at: o, quat: q, bone, scale: sc });
    };
    put([0, 0.01, 0], new THREE.SphereGeometry(0.06, 8, 6).scale(1, 0.95, 1.05), BONE_P);
    put([0, -0.04, 0.025], new THREE.BoxGeometry(0.07, 0.05, 0.07), BONE_P);
    put([0, -0.078, 0.012], new THREE.BoxGeometry(0.06, 0.018, 0.06), BONE_D);
    put([0, -0.064, 0.06], new THREE.BoxGeometry(0.055, 0.012, 0.012), BONE_P);
    for (const s of [1, -1]) put([s * 0.025, -0.008, 0.052], sph(0.02, 6, 4), DARK);
    put([0, -0.036, 0.064], sph(0.009, 5, 4), DARK);
  };
  const boneRod = (a: P3, c: P3, r: number, bone: Joint) => {
    b.capsule(a, c, r, { color: BONE_P, bone, sides: 6 });
    for (const e of [a, c]) b.part(sph(r * 1.5, 6, 4), BONE_P, { at: e, bone });
  };
  const feather = (at: P3, phiDeg: number, len: number, col: string, bone: Joint) => {
    const ph = (phiDeg * Math.PI) / 180;
    const outline: OutlinePoint[] = [
      [0, 0],
      [0.022, len * 0.15],
      [0.03, len * 0.55],
      [0, len, "sharp"],
      [-0.03, len * 0.55],
      [-0.022, len * 0.15],
    ];
    const fp = paint((_p, _n, s) => (Math.abs(s[0]) < 0.004 ? "#fff2c6" : s[1] > len * 0.8 ? YELLOW : col));
    b.extrude(outline, {
      at,
      x: [Math.cos(ph), Math.sin(ph), 0],
      y: [Math.sin(ph), -Math.cos(ph), 0],
      thickness: 0.01,
      color: fp,
      bone,
    });
  };

  // belt skull buckle
  skull([0, 0.97, 0.3], [0, -0.1, 1], 1.3, hips);
  // right hip bundle: skull + feathers
  b.rod([-0.22, 0.97, 0.2], [-0.25, 0.8, 0.22], 0.012, { color: LEATHER_P, bone: hips, sides: 5 });
  skull([-0.25, 0.77, 0.26], [-0.2, -0.2, 1], 0.9, hips);
  feather([-0.3, 0.97, 0.2], 14, 0.28, RED, hips);
  feather([-0.34, 0.97, 0.18], 26, 0.24, TEAL, hips);
  feather([-0.28, 0.97, 0.16], 6, 0.22, ORANGE, hips);
  // left hip pouch and teeth
  ell([0.27, 0.88, 0.14], [0.1, 0.12, 0.08], LEATHER_P, hips);
  b.part(sph(0.025, 6, 4), GOLD, { at: [0.27, 0.95, 0.2], bone: hips });
  for (let i = 0; i < 3; i++) b.spike([0.2 + i * 0.045, 0.78, 0.2], [0, -1, 0.1], 0.1, 0.02, { color: BONE_P, bone: hips });

  // ---- head ---------------------------------------------------------------------------------------------------
  const skullPart = ell([0, 2.02, 0.5], [0.23, 0.21, 0.25], SKIN, head);
  const skinH = b.surface(skullPart);
  ell([0, 1.9, 0.76], [0.16, 0.09, 0.15], SKIN, head); // upper jaw / muzzle
  ell([0, 1.97, 0.88], [0.09, 0.06, 0.07], SKIN, head); // nose
  ell([0, 1.88, 0.7], [0.12, 0.04, 0.15], MOUTH, head);
  for (const s of [1, -1]) {
    ell([s * 0.035, 1.98, 0.93], [0.018, 0.014, 0.012], DARK, head); // nostril
    ell([s * 0.17, 1.95, 0.6], [0.075, 0.07, 0.07], SKIN, head); // cheekbone
    ell([s * 0.095, 2.01, 0.69], [0.052, 0.044, 0.04], SOCKET, head);
    glow(b.part(sph(0.034, 8, 6), EYE, { bone: head, at: [s * 0.095, 2.01, 0.715] }), 1.2);
    b.part(sph(0.013, 5, 4), DARK, { bone: head, at: [s * 0.095, 2.01, 0.745] });
    b.capsule([s * 0.23, 2.1, 0.58], [s * 0.03, 2.075, 0.74], 0.05, { color: SKIN, bone: head, sides: 7 }); // brow
    b.part(sph(0.02, 5, 4), SK_DARK, { bone: head, at: [s * 0.14, 2.14, 0.66] });
    // ear
    const ear: OutlinePoint[] = [
      [0, 0.07],
      [0.12, 0.1],
      [0.3, 0.2, "sharp"],
      [0.2, 0.0],
      [0.1, -0.1],
      [0, -0.07],
    ];
    b.extrude(ear, { at: [s * 0.21, 2.05, 0.45], x: [s, 0, 0], thickness: 0.025, color: SKIN, bone: head });
    b.part(new THREE.TorusGeometry(0.03, 0.007, 5, 10), GOLD, { bone: head, at: [s * 0.3, 1.94, 0.45] });
    b.spike([s * 0.3, 1.91, 0.45], [0, -1, 0], 0.06, 0.012, { color: BONE_P, bone: head });
  }
  b.part(new THREE.TorusGeometry(0.035, 0.008, 5, 10), GOLD, { bone: head, at: [0, 1.92, 0.94] });
  // upper teeth
  for (let i = -2; i <= 2; i++)
    b.spike([i * 0.04, 1.86, 0.85 - Math.abs(i) * 0.02], [0, -1, 0.1], 0.05, 0.014, { color: BONE_P, bone: head });
  // lower jaw
  ell([0, 1.84, 0.6], [0.2, 0.09, 0.2], SKIN, jaw);
  ell([0, 1.82, 0.86], [0.14, 0.07, 0.09], SKIN, jaw);
  for (let i = -3; i <= 3; i++)
    b.spike([i * 0.04, 1.87, 0.93 - Math.abs(i) * 0.025], [0, 1, 0.1], 0.08, 0.016, { color: BONE_P, bone: jaw, sides: 6 });
  for (const s of [1, -1]) {
    const tp = bezier([s * 0.11, 1.85, 0.88], [s * 0.18, 1.93, 0.93], [s * 0.2, 2.03, 0.97], [s * 0.16, 2.14, 0.96]);
    b.sweep(tp, [0.05, 0], { color: TUSK, bone: jaw, caps: { start: "flat", end: "point" } });
    b.rod(tp.at(0.17), tp.at(0.24), 0.047, { color: GOLD, bone: jaw, sides: 6 });
    b.part(sph(0.012, 5, 4), RED, { bone: jaw, at: tp.at(0.5) });
  }
  // chin tuft
  for (let i = -1; i <= 1; i++)
    b.spike([i * 0.045, 1.76, 0.88], [i * 0.15, -1, 0.3], 0.1, 0.022, { color: SK_DARK, bone: jaw, sides: 5 });

  // ---- mohawk -------------------------------------------------------------------------------------------------
  const crestPath = catmull([
    [0, 2.13, 0.72],
    [0, 2.22, 0.56],
    [0, 2.2, 0.4],
    [0, 2.12, 0.3],
    [0, 2.0, 0.25],
  ]);
  b.sweep(crestPath, 0.03, { color: LEATHER_D, bone: head, sides: 6 });
  const placeBlade = (at: P3, deg: number, h: number, bone: Joint) => {
    const th = (deg * Math.PI) / 180;
    b.extrude(blade(h, 0.06), {
      at,
      x: [0, Math.sin(th), Math.cos(th)],
      y: [0, Math.cos(th), -Math.sin(th)],
      thickness: [0.045, 0.015],
      color: MOHAWK,
      bone,
    });
  };
  for (let i = 0; i < 11; i++) {
    const t = 0.03 + (i / 10) * 0.94;
    const p = crestPath.at(t);
    const h = 0.26 + 0.1 * Math.sin(Math.PI * t) + (random() - 0.5) * 0.05;
    placeBlade([p.x, p.y - 0.025, p.z], 8 + 45 * t, h, head);
  }
  placeBlade([0, 1.98, 0.2], 40, 0.3, head);
  placeBlade([0, 2.0, 0.1], 48, 0.28, chest);
  const skinT = b.surface([torso, hump]);
  for (let i = 0; i < 9; i++) {
    const y = 1.86 - i * 0.07;
    const hit = skinT.ray([0, y, -1], [0, 0, 1]);
    if (!hit) continue;
    const bone = y > 1.56 ? chest : y > 1.28 ? sp2 : sp1;
    placeBlade(
      [hit.at.x - hit.n.x * 0.02, hit.at.y - hit.n.y * 0.02, hit.at.z - hit.n.z * 0.02],
      52 + i * 3,
      0.3 - i * 0.017,
      bone,
    );
  }
  // hair ties of bone
  for (const t of [0.25, 0.55]) {
    const p = crestPath.at(t);
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), BONE_P, {
      bone: head,
      at: [p.x, p.y + 0.06, p.z],
      dir: [0, 0, 1],
      axis: "z",
      rotation: [0, 90, 0],
    });
  }

  // ---- necklace of teeth ---------------------------------------------------------------------------------------
  const cord = skinB.drape(
    catmull(
      [
        [0.3, 1.88, 0.12],
        [0.24, 1.72, 0.45],
        [0, 1.52, 0.56],
        [-0.24, 1.72, 0.45],
        [-0.3, 1.88, 0.12],
        [0, 1.9, -0.08],
      ],
      { closed: true },
    ),
    { lift: 0.035 },
  );
  b.sweep(cord, 0.015, { color: LEATHER_P });
  const tc = cord.closestT([0, 1.52, 0.56]);
  b.along(cord, 9, (at) => b.spike(at, [0, -1, 0], 0.1, 0.022, { color: BONE_P }), { from: tc - 0.22, to: tc + 0.22 });
  const cp = cord.at(tc);
  skull([cp.x, cp.y - 0.06, cp.z + 0.07], [0, -0.2, 1], 1.2, chest);

  // ---- arms ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const pts = limb([s * 0.56, 1.74, 0.1], [s * 1.0, 0.92, 0.3], [0.56, 0.56], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const [shoulder, elbow, wrist] = arm.joints;
    b.sweep(arm, [0.19, 0.16, 0.14, 0.15, 0.16], { color: SKIN });
    ell([s * 0.55, 1.74, 0.08], [0.24, 0.22, 0.22], SKIN, shoulder);

    // pauldron
    const ax: P3 = [s * 0.5, 0.87, 0];
    const base: P3 = [s * 0.58, 1.84, 0.08];
    b.lathe(
      [
        [0, 0],
        [0.24, 0],
        [0.27, 0.04],
        [0.24, 0.11],
        [0.14, 0.19],
        [0, 0.22],
      ],
      { at: base, axis: ax, color: LEATHER_P, bone: shoulder, segments: 10 },
    );
    b.ring({ at: base, axis: ax }, { count: 8, radius: 0.26 }, (item) =>
      b.spike(item, item, 0.035, 0.025, { color: GOLD, bone: shoulder, sides: 5 }),
    );
    const top: P3 = [base[0] + ax[0] * 0.16, base[1] + ax[1] * 0.16, base[2]];
    b.ring({ at: top, axis: ax }, { count: 5, radius: 0.14, tilt: 30 }, (item) =>
      b.spike(item, item, 0.17, 0.035, { color: BONE_P, bone: shoulder, sides: 6 }),
    );

    // arm bands
    const up = arm.at(0.3);
    b.lathe(
      [
        [0.15, -0.04],
        [0.185, -0.04],
        [0.185, 0.04],
        [0.15, 0.04],
      ],
      { at: up.at, axis: up.tangent, color: LEATHER_P, bone: shoulder },
    );
    b.ring(up, { count: 8, radius: 0.18 }, (item) => b.spike(item, item, 0.09, 0.025, { color: BONE_P, sides: 6 }));
    const fp = arm.at(0.85);
    b.lathe(
      [
        [0.14, -0.06],
        [0.18, -0.06],
        [0.18, 0.06],
        [0.14, 0.06],
      ],
      { at: fp.at, axis: fp.tangent, color: LEATHER_P, bone: elbow },
    );
    b.ring(fp, { count: 6, radius: 0.18 }, (item) => b.spike(item, item, 0.035, 0.016, { color: GOLD, sides: 5 }));
    // elbow spike
    b.spike([pts[1].x, pts[1].y, pts[1].z - 0.1], [s * 0.2, 0.15, -1], 0.2, 0.045, { color: BONE_P, bone: elbow, sides: 6 });

    // hand
    const d = pts[2].clone().sub(pts[1]).normalize();
    const q = aim(d);
    const zAx = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const inward = new THREE.Vector3(-s, 0, 0);
    const xAx = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const c = pts[2].clone().addScaledVector(d, 0.1);
    b.part(sph(1, 10, 7), SKIN, { bone: wrist, at: c, quat: q, scale: [0.13, 0.15, 0.14] });
    const claw = (tip: THREE.Vector3, dir: THREE.Vector3) =>
      b.spike(tip, dir, 0.08, 0.018, { color: CLAW, bone: wrist, sides: 5 });
    for (let i = 0; i < 4; i++) {
      const u = (i - 1.5) * 0.055;
      const bs = c.clone().addScaledVector(d, 0.1).addScaledVector(xAx, u).addScaledVector(zAx, 0.04);
      const p1 = bs.clone().addScaledVector(d, 0.07).addScaledVector(zAx, 0.03);
      const p2 = bs.clone().addScaledVector(d, 0.1).addScaledVector(zAx, 0.09);
      const p3 = bs.clone().addScaledVector(d, 0.06).addScaledVector(zAx, 0.15);
      b.sweep(catmull([bs, p1, p2, p3]), [0.037, 0.028], { color: SKIN, bone: wrist, sides: 6 });
      claw(p3, p3.clone().sub(p2));
    }
    const tb = c.clone().addScaledVector(inward, 0.08).addScaledVector(zAx, 0.06);
    const t1 = tb.clone().addScaledVector(zAx, 0.05).addScaledVector(d, 0.04);
    const t2 = tb.clone().addScaledVector(zAx, 0.1).addScaledVector(d, 0.09);
    b.sweep(catmull([tb, t1, t2]), [0.042, 0.03], { color: SKIN, bone: wrist, sides: 6 });
    claw(t2, t2.clone().sub(t1));

    // ---- legs --------------------------------------------------------------------------------------------------
    const lp = limb([s * 0.24, 0.96, 0], [s * 0.3, 0.14, 0], [0.5, 0.5], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, lp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.3, 0, 0.15],
    });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    b.sweep(leg, [0.21, 0.2, 0.16, 0.14, 0.125], { color: SKIN });
    ell([lp[1].x, lp[1].y, lp[1].z + 0.08], [0.16, 0.15, 0.14], SKIN, knee);
    b.spike([lp[1].x, lp[1].y + 0.02, lp[1].z + 0.14], [0, 0.15, 1], 0.14, 0.035, { color: BONE_P, bone: knee, sides: 6 });
    ell([s * 0.3, 0.1, 0.12], [0.15, 0.1, 0.25], SKIN, ankle);
    for (let i = 0; i < 3; i++) {
      const tx = s * 0.3 + (i - 1) * 0.1;
      const tz = i === 1 ? 0.35 : 0.32;
      ell([tx, 0.065, tz], [0.055, 0.055, 0.07], SKIN, ankle);
      b.spike([tx, 0.05, tz + 0.05], [0, -0.15, 1], 0.09, 0.028, { color: CLAW, bone: ankle, sides: 5 });
    }
    b.lathe(
      [
        [0.12, -0.05],
        [0.16, -0.05],
        [0.16, 0.05],
        [0.12, 0.05],
      ],
      { at: [s * 0.3, 0.25, 0], axis: [0, 1, 0], color: LEATHER_P, bone: knee },
    );
    b.part(sph(0.025, 5, 4), GOLD, { bone: knee, at: [s * 0.3, 0.25, 0.16] });
  }

  // ---- bone totem on the back ---------------------------------------------------------------------------------
  const A = new THREE.Vector3(-0.3, 1.1, -0.34);
  const B = new THREE.Vector3(0.3, 2.4, -0.36);
  const P = (t: number) => new THREE.Vector3().lerpVectors(A, B, t);
  b.rod(A, B, 0.028, { color: WOOD, bone: chest, sides: 6 });
  for (const t of [0.3, 0.55]) {
    const q = P(t);
    const hit = skinT.ray([q.x, q.y, -1], [0, 0, 1]);
    if (hit) b.capsule(q, hit.at, 0.02, { color: LEATHER_P, bone: chest, sides: 5 });
  }
  for (let i = 0; i < 5; i++) {
    const q = P(0.45 + 0.07 * i);
    b.part(sph(0.04, 6, 4), i % 2 ? BONE_P : RED, { bone: chest, at: q });
  }
  skull([B.x, B.y + 0.08, B.z], [0.3, 0.1, 1], 1.8, chest);
  feather([B.x - 0.1, B.y - 0.04, B.z - 0.03], 40, 0.3, RED, chest);
  feather([B.x + 0.1, B.y - 0.04, B.z - 0.03], -40, 0.3, TEAL, chest);
  boneRod([B.x - 0.1, B.y - 0.15, B.z + 0.02], [B.x + 0.12, B.y - 0.34, B.z + 0.02], 0.012, chest);
  boneRod([B.x + 0.1, B.y - 0.15, B.z + 0.02], [B.x - 0.12, B.y - 0.34, B.z + 0.02], 0.012, chest);

  // open the jaw a little in the rest pose
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // keep a handle on the head surface for tooling
  void skinH;
  return b.root;
}
