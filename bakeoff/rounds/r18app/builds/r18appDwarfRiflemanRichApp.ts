import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { grain, mix, mottle, paint, resolve, smoothstep } from "../../../../src/paint";
import type { ColorInput, Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, heroic dwarf marksman in a blue coat, steel pauldrons and a tricorn hat, with a braided copper beard and a brass-belled blunderbuss at the ready.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN = "#e09a6c";
const SKIN_D = "#c0764c";
const BLUSH = "#e8785a";
const BEARD = "#c4541a";
const BEARD_L = "#f39a3c";
const BEARD_D = "#82300f";
const COAT = "#2c5db0";
const COAT_D = "#1b3a7c";
const GOLD = "#f4c542";
const GOLD_D = "#b57d1c";
const LEATHER = "#8a5330";
const LEATHER_D = "#52301a";
const LEATHER_L = "#b57a45";
const STEEL = "#93a3bb";
const STEEL_L = "#c7d4e6";
const BRASS = "#d89a30";
const WOOD = "#92592e";
const WOOD_D = "#5c3519";
const CREAM = "#f0e2bc";
const RED = "#c9302a";
const INK = "#1d1420";
const TROUSER = "#5c5048";
const TROUSER_D = "#3e352f";
const FELT = "#5a3b28";
const FELT_D = "#3a2418";
const CANVAS = "#cdb98a";

/** Hand-painted shading: a warm highlight where a surface faces up, a cool shadow where it faces down. */
const hp = (base: ColorInput, k = 0.2) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    return n.y > 0 ? mix(c, "#fff0c0", n.y * k) : mix(c, "#1c1a48", -n.y * k * 1.3);
  });

/** Streaky hair that follows a tube: bands round the section, a slow twist along it, darker toward the root. */
const hair = (a: string, b: string, dark: string, freq = 0.22) =>
  hp(
    paint((_p, _n, s) => {
      const w = 0.5 + 0.5 * Math.sin(s[1] * freq + s[0] * 9);
      const c = mix(a, b, smoothstep(0.3, 0.7, w));
      return mix(c, dark, 0.45 * (1 - smoothstep(0, 0.25, s[0])));
    }),
    0.25,
  );

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const R = rng(11);

  // -------------------------------------------------------------------------------------------------------------
  // Weapon frame: the blunderbuss is held on the right side, barrel forward and up. Local +X left, +Y up, +Z along the barrel.
  const F = V(-0.04, 0.38, 0.92).normalize();
  const WU = V(0, 1, 0).addScaledVector(F, -F.y).normalize();
  const WL = WU.clone().cross(F).normalize();
  const O = V(-0.5, 0.63, 0.2);
  const wq = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(WL, WU, F));
  const qAlong = new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2); // geometry +Y -> weapon +Z
  const W = (x: number, y: number, z: number) =>
    O.clone().addScaledVector(WL, x).addScaledVector(WU, y).addScaledVector(F, z);
  const WD = (x: number, y: number, z: number) => WL.clone().multiplyScalar(x).addScaledVector(WU, y).addScaledVector(F, z);
  const gz = (y: number) => -0.045 - (0.045 - y) * 0.13; // grip centre line z as a function of y

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.52, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.52, 0],
      [0, 0.66, 0.015],
      [0, 0.8, 0.02],
      [0, 0.93, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.93, 0],
      [0, 0.99, 0.012],
      [0, 1.04, 0.02],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.04, 0.02], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.075, 0.0], aim: [0, 1.04, 0.12], role: "jaw" });

  const wristRp = W(-0.03, 0.0, gz(0) - 0.105);
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  const clav: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    clav[S] = b.joint(`clavicle${S}`, { parent: chest, at: [s * 0.1, 0.93, 0.0], aim: [s * 0.29, 0.94, 0] });
    const pts: number[][] =
      s > 0
        ? [
            [0.29, 0.94, 0],
            [0.41, 0.73, 0.03],
            [0.47, 0.53, 0.11],
          ]
        : [
            [-0.29, 0.94, 0],
            [-0.405, 0.74, -0.02],
            [wristRp.x, wristRp.y, wristRp.z],
          ];
    arms[S] = b.chain(`arm${S}`, catmull(pts), {
      parent: clav[S],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
  }
  const wristL = arms.L.joints[2];
  const wristR = arms.R.joints[2];

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const toes: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.14;
    legs[S] = b.chain(
      `leg${S}`,
      catmull([
        [x, 0.5, 0],
        [x, 0.3, 0.04],
        [x, 0.115, -0.01],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [x, 0, 0.06] },
    );
    toes[S] = b.joint(`toe${S}`, {
      parent: legs[S].joints[2],
      at: [x, 0.07, 0.09],
      aim: [x, 0.04, 0.2],
      role: "hinge",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Paints & textures
  const SKINP = hp(mottle(SKIN, SKIN_D, { size: 0.05, seed: 2, contrast: 0.7 }), 0.22);
  const RUDDY = hp(mottle(BLUSH, SKIN, { size: 0.035, seed: 5, contrast: 0.8 }), 0.2);
  const COATP = hp(
    paint((p, n) => {
      if (n.z > 0.15 && Math.abs(Math.abs(p.x) - 0.16) < 0.007) return GOLD;
      return resolve(mottle(COAT, COAT_D, { size: 0.04, seed: 3, contrast: 0.7 }), p, n);
    }),
    0.22,
  );
  const SLEEVE = hp(mottle(COAT, COAT_D, { size: 0.04, seed: 8, contrast: 0.7 }), 0.22);
  const LEATHERP = hp(mottle(LEATHER, LEATHER_D, { size: 0.03, seed: 6, contrast: 0.9 }), 0.22);
  const LEATHER2 = hp(mottle(LEATHER_L, LEATHER, { size: 0.025, seed: 9, contrast: 0.9 }), 0.22);
  const TROUSERP = hp(mottle(TROUSER, TROUSER_D, { size: 0.04, seed: 4, contrast: 0.7 }), 0.18);
  const STEELP = hp(mottle(STEEL, STEEL_L, { size: 0.02, seed: 7, contrast: 1.2 }), 0.3);
  const BOOTP = hp(
    paint((p, n) => {
      const c = resolve(mottle(LEATHER_D, "#6d4125", { size: 0.03, seed: 12, contrast: 0.9 }), p, n);
      return p.y < 0.05 ? mix(c, INK, 0.25) : c;
    }),
    0.22,
  );
  const FELTP = hp(mottle(FELT, FELT_D, { size: 0.03, seed: 13, contrast: 0.8 }), 0.2);
  const WOODP = hp(grain(WOOD, WOOD_D, { size: 0.012, axis: F, seed: 3 }), 0.2);
  const GOLDP = hp(mottle(GOLD, GOLD_D, { size: 0.02, seed: 14, contrast: 0.7 }), 0.3);
  const BRASSP = hp(mottle(BRASS, "#9a6218", { size: 0.02, seed: 15, contrast: 0.7 }), 0.3);
  const HAIR = hair(BEARD, BEARD_L, BEARD_D);
  const HAIR2 = hair("#d7621f", "#ffb04a", BEARD_D, 0.3);
  const CANVASP = hp(mottle(CANVAS, "#b49c6a", { size: 0.03, seed: 16, contrast: 0.8 }), 0.2);
  const HORNP = hp(
    paint((p, n) => {
      const band = Math.sin(p.y * 90 + p.x * 20) > 0.55;
      return resolve(band ? mottle("#8a6a3a", "#5a4020", { size: 0.02 }) : mottle(CREAM, "#d9c48f", { size: 0.025 }), p, n);
    }),
    0.25,
  );

  const EYE = svg(
    `<svg viewBox="0 0 64 40">
      <path d="M3 24 Q18 6 62 18 Q40 38 3 24Z" fill="#f4ebd2"/>
      <circle cx="33" cy="22" r="11" fill="#3e86d8"/>
      <circle cx="33" cy="26" r="10" fill="#7ec1ff" opacity="0.55"/>
      <circle cx="33" cy="22" r="11" fill="none" stroke="#13233e" stroke-width="2.4"/>
      <circle cx="33" cy="22" r="5.5" fill="#0c101c"/>
      <circle cx="28.5" cy="17.5" r="3.4" fill="#fff"/><circle cx="38" cy="27" r="1.6" fill="#fff"/>
      <path d="M2 24 Q20 3 63 16" stroke="#2a1410" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M6 27 Q30 40 60 21" stroke="#8a4a30" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const SCROLL = svg(
    `<svg viewBox="0 0 120 50">
      <path d="M6 28 C16 6 36 6 40 24 C42 36 28 38 28 28 C28 20 38 18 46 26 S70 42 82 26 S104 8 114 24" stroke="#ffd35a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <circle cx="82" cy="26" r="3.5" fill="#ffd35a"/><circle cx="14" cy="30" r="2.6" fill="#ffd35a"/>
      <path d="M30 42 Q60 50 98 40" stroke="#ffd35a" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.9"/>
    </svg>`,
    { size: 384 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="26" fill="#6a3d14"/><circle cx="32" cy="32" r="26" fill="none" stroke="#ffd35a" stroke-width="4"/>
      <path d="M32 12 L32 52 M17 24 L47 24 M20 42 L44 42 M32 12 L20 22 M32 12 L44 22" stroke="#ffd35a" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 192 },
  );
  const TATTOO = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M8 10 L56 10 M8 54 L56 54" stroke="#2f4f8f" stroke-width="5" stroke-linecap="round"/>
      <path d="M32 14 L32 50 M18 24 L46 24 M20 40 L44 40 M32 14 L22 22 M32 14 L42 22" stroke="#2f4f8f" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 24 64">
      <path d="M3 64 C6 40 10 18 13 0 C15 18 19 40 22 64Z" fill="#c4541a"/>
      <path d="M9 64 C10 44 12 22 13 4 C14 22 16 44 17 64Z" fill="#f59a3a"/>
    </svg>`,
    { size: 128 },
  );
  const PLUME = svg(
    `<svg viewBox="0 0 48 128">
      <path d="M24 128 C-2 96 0 40 24 0 C48 40 50 96 24 128Z" fill="#c9302a"/>
      <path d="M24 124 C8 96 8 48 24 6 C40 48 40 96 24 124Z" fill="#e2493f"/>
      <path d="M24 126 L24 4" stroke="#f6dca0" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 100 L8 84 M24 80 L6 62 M24 60 L9 44 M24 40 L14 26 M24 100 L40 84 M24 80 L42 62 M24 60 L39 44 M24 40 L34 26" stroke="#9a1f1c" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
    { size: 160 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Torso: coat, belt, skirt of tassets
  const torso = b.loft(
    [
      { at: [0, 0.54, 0], w: 0.4, h: 0.3 },
      { at: [0, 0.65, 0.012], w: 0.44, h: 0.34 },
      { at: [0, 0.8, 0.012], w: 0.54, h: 0.34 },
      { at: [0, 0.92, -0.005], w: 0.56, h: 0.28 },
      { at: [0, 0.985, 0], w: 0.26, h: 0.22 },
    ],
    { bone: [hips, spine], color: COATP, name: "torso" },
  );
  const tsk = b.surface(torso);

  // Neck
  b.sweep(neck, [0.075, 0.07], { color: SKINP, name: "neckTube" });
  // Collar: a stiff upturned leather collar with gold edge
  b.lathe(
    [
      [0.1, 0],
      [0.15, -0.012],
      [0.17, 0.035],
      [0.155, 0.04],
      [0.12, 0.012],
    ],
    { at: [0, 0.955, 0.0], bone: chest, color: LEATHERP, name: "collar" },
  );
  b.lathe(
    [
      [0.165, 0.028],
      [0.172, 0.034],
      [0.158, 0.043],
      [0.152, 0.038],
    ],
    { at: [0, 0.955, 0.0], bone: chest, color: GOLDP, name: "collarTrim" },
  );

  // Belt
  const beltLoop = tsk.loop([0, 0.6, 0], { lift: 0.012 });
  b.sweep(beltLoop, () => [0.012, 0.04], { section: "box", color: LEATHERP, up: [0, 1, 0], bone: hips, name: "belt" });
  const beltTrim = tsk.loop([0, 0.6, 0], { lift: 0.022 });
  b.sweep(beltTrim, () => [0.004, 0.006], { section: "box", color: GOLDP, up: [0, 1, 0], bone: hips, name: "beltTrim" });
  const buckleHit = tsk.ray([0, 0.6, 1], [0, 0, -1])!;
  b.part(new THREE.BoxGeometry(0.1, 0.082, 0.02), BRASSP, {
    at: [0, 0.6, buckleHit.at.z + 0.012],
    bone: hips,
    name: "buckle",
  });
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    at: [0, 0.6, buckleHit.at.z + 0.0235],
    dir: [0, 0, 1],
    axis: "z",
    texture: RUNE,
    bone: hips,
    name: "buckleRune",
  });
  {
    const pts: THREE.Vector3[] = [];
    b.along(beltLoop, 22, (at) => {
      pts.push(at.at.clone());
    });
    b.part(mergeGeometries(pts.map((p) => new THREE.SphereGeometry(0.0095, 5, 4).translate(p.x, p.y, p.z)))!, BRASS, {
      bone: hips,
      at: [0, 0, 0],
      name: "beltStuds",
    });
  }

  // Tasset skirt
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + Math.PI / N;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const back = cz < -0.2;
    const len = back ? 0.34 : 0.27;
    const rx = 0.225;
    const rz = 0.185;
    const pos = V(rx * sx, 0.59, rz * cz + 0.01);
    const outward = V(sx, 0, cz).normalize();
    const tangent = V(cz, 0, -sx).normalize();
    const flare = 0.2;
    const ydir = V(outward.x * flare, -1, outward.z * flare).normalize();
    const panel = b.extrude(
      [
        [-0.057, 0],
        [0.057, 0],
        [0.075, len * 0.9],
        [0, len, "sharp"],
        [-0.075, len * 0.9],
      ],
      {
        at: pos,
        x: tangent,
        y: ydir,
        thickness: 0.013,
        bevel: 0.004,
        bone: hips,
        color: hp(
          paint((p, n, sv) => {
            if (sv[1] > len * 0.78) return GOLD;
            if (Math.abs(sv[0]) < 0.007) return back ? COAT_D : LEATHER_D;
            return resolve(i % 2 ? LEATHERP : back ? SLEEVE : LEATHER2, p, n);
          }),
          0.2,
        ),
        name: `tasset${i}`,
      },
    );
    b.part(new THREE.SphereGeometry(0.0085, 5, 4), BRASS, {
      at: panel.local([0, len * 0.14, 0.008]),
      bone: hips,
      name: `tassetRivet${i}`,
    });
  }

  // Bandolier with powder vials
  const strapRough = catmull(
    [
      [-0.17, 0.975, 0.0],
      [-0.1, 0.9, 0.2],
      [0.06, 0.78, 0.22],
      [0.19, 0.64, 0.14],
      [0.22, 0.62, -0.02],
      [0.12, 0.72, -0.17],
      [-0.06, 0.88, -0.16],
    ],
    { closed: true },
  );
  const strapPath = tsk.drape(strapRough, { lift: 0.012 });
  b.sweep(strapPath, () => [0.011, 0.03], { section: "box", color: LEATHERP, bone: chest, name: "bandolier" });
  const vialPts: THREE.Vector3[] = [];
  b.along(strapPath.slice(0.08, 0.38), 7, (at) => {
    vialPts.push(at.at.clone());
  });
  vialPts.forEach((p, i) => {
    const out = tsk.nearest(p).n;
    const base = p.clone().addScaledVector(out, 0.03);
    b.part(new THREE.CylinderGeometry(0.0165, 0.0165, 0.075, 7), i % 2 ? WOODP : LEATHER2, {
      at: base.clone().add(V(0, 0.03, 0)),
      bone: chest,
      name: `vial${i}`,
    });
    b.part(new THREE.CylinderGeometry(0.0185, 0.0185, 0.014, 7), BRASS, {
      at: base.clone().add(V(0, 0.07, 0)),
      bone: chest,
      name: `vialCap${i}`,
    });
    b.part(new THREE.CylinderGeometry(0.0172, 0.0172, 0.01, 7), GOLD, {
      at: base.clone().add(V(0, 0.005, 0)),
      bone: chest,
      name: `vialBand${i}`,
    });
  });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.012), BRASS, { at: strapPath.at(0.3).clone().addScaledVector(tsk.nearest(strapPath.at(0.3)).n, 0.014), bone: chest, name: "bandolierBuckle" });

  // Pouches, horn, tankard, hatchet on the belt
  const pouch = (center: THREE.Vector3, face: THREE.Vector3, w: number, hgt: number, d: number, name: string) => {
    b.part(new THREE.BoxGeometry(w, hgt, d), LEATHERP, { at: center, dir: face, axis: "z", bone: hips, name: `${name}Body` });
    b.part(new THREE.BoxGeometry(w * 1.04, hgt * 0.45, d * 1.12), LEATHER2, {
      at: center.clone().add(V(0, hgt * 0.3, 0)),
      dir: face,
      axis: "z",
      bone: hips,
      name: `${name}Flap`,
    });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BRASS, {
      at: center.clone().add(V(0, hgt * 0.04, 0)).addScaledVector(face, d * 0.6),
      bone: hips,
      name: `${name}Stud`,
    });
  };
  pouch(V(-0.215, 0.55, 0.07), V(-1, 0, 0.35), 0.1, 0.105, 0.05, "pouchR");
  pouch(V(0.19, 0.54, -0.1), V(0.6, 0, -1), 0.09, 0.09, 0.045, "pouchL");

  // Powder horn on the left hip
  {
    const horn = catmull([
      [0.255, 0.6, 0.1],
      [0.285, 0.5, 0.13],
      [0.27, 0.4, 0.17],
      [0.22, 0.34, 0.2],
    ]);
    b.sweep(horn, [0.03, 0.01], { color: HORNP, caps: { start: "flat", end: "point" }, bone: hips, name: "powderHorn" });
    b.part(new THREE.CylinderGeometry(0.034, 0.03, 0.026, 8), BRASSP, { at: [0.255, 0.612, 0.1], dir: [0.1, 1, 0.1], bone: hips, name: "hornCap" });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { at: [0.22, 0.34, 0.2], bone: hips, name: "hornTip" });
    b.sweep(
      catmull([
        [0.215, 0.64, 0.02],
        [0.27, 0.66, 0.1],
        [0.285, 0.6, 0.12],
      ]),
      0.006,
      { color: LEATHER_D, bone: hips, name: "hornCord" },
    );
  }
  // Tankard on the right back
  {
    const c = V(-0.19, 0.5, -0.14);
    b.part(new THREE.CylinderGeometry(0.052, 0.046, 0.1, 9), WOODP, { at: c, bone: hips, name: "tankard" });
    for (const dy of [-0.03, 0.03])
      b.part(new THREE.CylinderGeometry(0.0535, 0.0535, 0.011, 9), BRASS, { at: c.clone().add(V(0, dy, 0)), bone: hips, name: "tankardHoop" });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 9), CREAM, { at: c.clone().add(V(0, 0.054, 0)), bone: hips, name: "tankardFoam" });
    b.sweep(
      bezier(c.clone().add(V(-0.05, 0.03, 0)), c.clone().add(V(-0.1, 0.03, 0)), c.clone().add(V(-0.1, -0.03, 0)), c.clone().add(V(-0.05, -0.03, 0))),
      0.01,
      { color: BRASSP, bone: hips, name: "tankardHandle" },
    );
  }
  // Hatchet on the left back
  {
    const base = V(0.12, 0.56, -0.2);
    const tipP = V(0.2, 0.34, -0.19);
    b.rod(base, tipP, 0.014, WOODP, { bone: hips, name: "hatchetHaft" });
    b.extrude(
      [
        [0, 0],
        [0.07, 0.03, "sharp"],
        [0.075, -0.07, "sharp"],
        [0.0, -0.045],
        [-0.02, -0.02],
      ],
      { at: V(0.17, 0.43, -0.17), x: [0, 0, 1], y: [0.35, 1, 0], thickness: 0.016, bevel: 0.004, smoothing: 0, bone: hips, color: STEELP, name: "hatchetHead" },
    );
  }

  // Backpack and bedroll
  b.extrude(
    [
      [-0.15, -0.14],
      [0.15, -0.14],
      [0.15, 0.14],
      [-0.15, 0.14],
    ],
    { at: [0, 0.76, -0.225], x: [1, 0, 0], thickness: 0.12, bevel: 0.025, smoothing: 1, color: LEATHERP, bone: chest, name: "pack" },
  );
  b.extrude(
    [
      [-0.14, 0.0],
      [0.14, 0.0],
      [0.13, 0.12],
      [0.0, 0.14],
      [-0.13, 0.12],
    ],
    { at: [0, 0.77, -0.288], x: [1, 0, 0], thickness: 0.02, bevel: 0.006, color: LEATHER2, bone: chest, name: "packFlap" },
  );
  b.part(new THREE.BoxGeometry(0.036, 0.04, 0.014), BRASS, { at: [0, 0.8, -0.3], bone: chest, name: "packBuckle" });
  b.lathe(
    [
      [0, -0.19],
      [0.066, -0.19],
      [0.075, -0.17],
      [0.075, 0.17],
      [0.066, 0.19],
      [0, 0.19],
    ],
    { at: [0, 0.98, -0.245], axis: [1, 0, 0], segments: 10, color: CANVASP, bone: chest, name: "bedroll" },
  );
  for (const x of [-0.11, 0.11]) {
    b.part(new THREE.TorusGeometry(0.078, 0.009, 5, 12), LEATHERP, { at: [x, 0.98, -0.245], dir: [1, 0, 0], axis: "z", bone: chest, name: "bedrollStrap" });
    b.part(new THREE.BoxGeometry(0.02, 0.02, 0.012), BRASS, { at: [x, 0.98, -0.322], bone: chest, name: "bedrollBuckle" });
  }
  b.part(new THREE.SphereGeometry(0.075, 8, 6), RED, { at: [0.19, 0.98, -0.245], scale: [0.35, 1, 1], bone: chest, name: "bedrollEnd" });

  // Pauldrons, elbow caps
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = arms[S].joints[0];
    const axis = V(s * 0.55, 0.84, 0).normalize();
    const c = V(s * 0.3, 0.955, 0).addScaledVector(axis, -0.01);
    const dome = (r: number, hh: number, y0: number, nm: string, col: string | Paint) =>
      b.lathe(
        [
          [0, y0 + hh],
          [r * 0.45, y0 + hh * 0.96],
          [r * 0.8, y0 + hh * 0.7],
          [r, y0 + hh * 0.05],
          [r, y0],
          [0, y0],
        ],
        { at: c, axis, bone: sh, segments: 10, smoothing: 1, color: col, name: nm },
      );
    dome(0.15, 0.09, 0.0, `pauldron${S}`, hp(paint((p, n, sv) => (sv[0] < 0.014 ? GOLD : resolve(STEELP, p, n))), 0.3));
    dome(0.172, 0.05, -0.045, `pauldronLame${S}`, hp(paint((p, n, sv) => (sv[0] < -0.03 ? GOLD : resolve(STEELP, p, n))), 0.3));
    b.part(new THREE.SphereGeometry(0.03, 6, 5), BRASSP, { at: c.clone().addScaledVector(axis, 0.095), bone: sh, name: `pauldronBoss${S}` });
    b.spike(c.clone().addScaledVector(axis, 0.11), axis, 0.06, 0.016, { color: STEELP, bone: sh, name: `pauldronSpike${S}` });
    const rivets: THREE.Vector3[] = [];
    const side = V(0, 0, 1);
    const up2 = axis.clone().cross(side).normalize();
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      rivets.push(c.clone().addScaledVector(side, Math.cos(a) * 0.15).addScaledVector(up2, Math.sin(a) * 0.15).addScaledVector(axis, 0.012));
    }
    b.part(mergeGeometries(rivets.map((p) => new THREE.SphereGeometry(0.009, 5, 4).translate(p.x, p.y, p.z)))!, BRASS, { bone: sh, at: [0, 0, 0], name: `pauldronRivets${S}` });
    // rune plate under the boss
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
      at: c.clone().addScaledVector(axis, 0.066).add(V(0, 0, 0.0)).addScaledVector(V(0, 0, 1), 0.09),
      dir: [0, 0.15, 1],
      axis: "z",
      texture: RUNE,
      bone: sh,
      name: `pauldronRune${S}`,
    });
    // elbow cap
    const el = arms[S].joints[1];
    b.part(new THREE.SphereGeometry(0.058, 7, 5), STEELP, { at: el.at.clone().add(V(s * 0.03, 0.0, -0.035)), scale: [0.8, 1, 0.8], bone: el, name: `elbowCap${S}` });
    b.part(new THREE.SphereGeometry(0.015, 5, 4), BRASS, { at: el.at.clone().add(V(s * 0.075, 0.0, -0.035)), bone: el, name: `elbowRivet${S}` });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms
  const armR = (t: number) => 0.088 - 0.03 * t;
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = arms[S];
    const tube = b.sweep(arm, armR, { bands: [[0.5, SLEEVE], [1, SKINP]], name: `arm${S}Tube` });
    b.sweep(arm, (t) => armR(t) + 0.01, { from: 0.455, to: 0.52, color: GOLDP, caps: "flat", name: `sleeveCuff${S}` });
    b.sweep(arm, (t) => armR(t) + 0.011, { from: 0.6, to: 0.86, color: LEATHERP, caps: "flat", name: `bracer${S}` });
    b.sweep(arm, (t) => armR(t) + 0.016, { from: 0.58, to: 0.61, color: GOLDP, caps: "flat", name: `bracerRim${S}` });
    const studs: THREE.Vector3[] = [];
    for (let k = 0; k < 5; k++) {
      const hit = tube.at(0.66 + k * 0.045, s > 0 ? 80 : -80, 0.014);
      studs.push(hit.at.clone());
    }
    b.part(mergeGeometries(studs.map((p) => new THREE.SphereGeometry(0.0085, 5, 4).translate(p.x, p.y, p.z)))!, BRASS, { bone: arm.joints[1], at: [0, 0, 0], name: `bracerStuds${S}` });
    // forearm hair patch / tattoo on the free arm
    if (s > 0) {
      const h = tube.at(0.7, 25, 0.0);
      b.decal(b.surface(tube), TATTOO, { at: h.at, dir: h.n, size: [0.07, 0.07], up: [0, 1, 0] });
    }
  }

  // Hands
  const gloveFingers = (name: string, pts: THREE.Vector3[], r0: number, r1: number, parent: Joint) => {
    const ch = b.chain(name, catmull(pts.map((p) => [p.x, p.y, p.z])), {
      parent,
      names: [`${name}1`, `${name}2`],
      role: "digit",
    });
    b.sweep(ch, [r0, r1], { bands: [[0.62, LEATHERP], [1, SKINP]], name: `${name}Tube` });
    return ch;
  };
  // right hand: fist round the grip
  {
    b.part(new THREE.BoxGeometry(0.075, 0.12, 0.058), LEATHERP, { at: W(-0.02, -0.03, gz(-0.03) - 0.055), quat: wq, bone: wristR, name: "palmR" });
    b.part(new THREE.BoxGeometry(0.082, 0.126, 0.02), LEATHER2, { at: W(-0.02, -0.03, gz(-0.03) - 0.085), quat: wq, bone: wristR, name: "gloveBackR" });
    const names = ["fingerIndexR", "fingerMiddleR", "fingerRingR", "fingerPinkyR"];
    for (let i = 0; i < 4; i++) {
      const y = 0.025 - i * 0.033;
      const rr = 0.0455 + (i === 3 ? -0.003 : 0);
      const phis = [-25, -85, -145, -200];
      const pts = phis.map((d) => {
        const a = (d * Math.PI) / 180;
        return W(rr * Math.sin(a), y, gz(y) - rr * Math.cos(a));
      });
      gloveFingers(names[i], pts, i === 3 ? 0.014 : 0.0165, 0.0125, wristR);
    }
    gloveFingers(
      "thumbR",
      [W(-0.02, 0.045, gz(0.045) - 0.07), W(0.02, 0.054, gz(0.05) - 0.05), W(0.052, 0.047, gz(0.047) - 0.005), W(0.056, 0.04, gz(0.04) + 0.04)],
      0.019,
      0.014,
      wristR,
    );
  }
  // left hand: open, relaxed
  {
    const wp = wristL.at.clone();
    const d = V(0.1, -0.94, 0.32).normalize();
    const q = aim(d);
    const zdir = V(0, 0, 1).applyQuaternion(q);
    const xdir = V(1, 0, 0).applyQuaternion(q); // model right
    const palmC = wp.clone().addScaledVector(d, 0.05);
    b.part(new THREE.BoxGeometry(0.05, 0.1, 0.1), LEATHERP, { at: palmC, quat: q, bone: wristL, name: "palmL" });
    b.part(new THREE.BoxGeometry(0.054, 0.04, 0.106), LEATHER2, { at: wp.clone().addScaledVector(d, 0.012), quat: q, bone: wristL, name: "gloveCuffL" });
    const lens = [0.085, 0.1, 0.095, 0.075];
    const ids = ["fingerIndexL", "fingerMiddleL", "fingerRingL", "fingerPinkyL"];
    for (let i = 0; i < 4; i++) {
      const zo = 0.034 - i * 0.023;
      const P0 = palmC.clone().addScaledVector(d, 0.045).addScaledVector(zdir, zo);
      const L = lens[i];
      const pts = [
        P0,
        P0.clone().addScaledVector(d, L * 0.45).addScaledVector(zdir, L * 0.04),
        P0.clone().addScaledVector(d, L * 0.8).addScaledVector(zdir, L * 0.22),
        P0.clone().addScaledVector(d, L * 0.9).addScaledVector(zdir, L * 0.42),
      ];
      gloveFingers(ids[i], pts, i === 3 ? 0.0135 : 0.016, 0.012, wristL);
    }
    const T0 = palmC.clone().addScaledVector(zdir, 0.05).addScaledVector(d, 0.0).addScaledVector(xdir, -0.012);
    gloveFingers(
      "thumbL",
      [T0, T0.clone().addScaledVector(zdir, 0.03).addScaledVector(d, 0.025), T0.clone().addScaledVector(zdir, 0.055).addScaledVector(d, 0.065), T0.clone().addScaledVector(zdir, 0.06).addScaledVector(d, 0.095)],
      0.019,
      0.014,
      wristL,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs & boots
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.14;
    const leg = legs[S];
    const ankle = leg.joints[2];
    const toe = toes[S];
    b.sweep(leg, [0.115, 0.098, 0.084], { color: TROUSERP, name: `trouser${S}` });
    // knee pad
    b.lathe(
      [
        [0, 0],
        [0.06, 0],
        [0.058, 0.014],
        [0.04, 0.034],
        [0, 0.04],
      ],
      { at: [x, 0.31, 0.088], axis: [0, 0.18, 1], segments: 8, color: hp(paint((p, n, sv) => (sv[0] < 0.01 ? GOLD : resolve(LEATHERP, p, n))), 0.25), bone: leg.joints[1], name: `kneePad${S}` },
    );
    b.part(new THREE.SphereGeometry(0.011, 5, 4), BRASS, { at: [x, 0.315, 0.134], bone: leg.joints[1], name: `kneeBoss${S}` });
    // boot shaft
    b.rod([x, 0.268, 0.02], [x, 0.1, -0.01], [0.098, 0.093], BOOTP, { sides: 9, bone: ankle, name: `bootShaft${S}` });
    b.rod([x, 0.285, 0.021], [x, 0.255, 0.019], 0.108, LEATHER2, { sides: 9, bone: ankle, name: `bootCuff${S}` });
    b.rod([x, 0.268, 0.02], [x, 0.262, 0.02], 0.112, GOLDP, { sides: 9, bone: ankle, name: `bootCuffTrim${S}` });
    for (const y of [0.2, 0.15]) {
      b.part(new THREE.TorusGeometry(0.097, 0.009, 4, 12), LEATHER_D, { at: [x, y, 0.01 - (y - 0.1) * 0.15], dir: [0, 1, 0], axis: "z", bone: ankle, name: `bootStrap${S}` });
      b.part(new THREE.BoxGeometry(0.034, 0.03, 0.014), BRASS, { at: [x, y, 0.108 - (y - 0.1) * 0.15], bone: ankle, name: `bootBuckle${S}` });
    }
    b.loft(
      [
        { at: [x, 0.095, -0.06], w: 0.155, h: 0.14 },
        { at: [x, 0.085, 0.04], w: 0.17, h: 0.12 },
      ],
      { bone: ankle, color: BOOTP, name: `heel${S}` },
    );
    b.loft(
      [
        { at: [x, 0.085, 0.04], w: 0.17, h: 0.12 },
        { at: [x, 0.07, 0.15], w: 0.168, h: 0.1 },
        { at: [x, 0.062, 0.215], w: 0.13, h: 0.08 },
      ],
      { bone: toe, color: BOOTP, name: `toeBox${S}` },
    );
    b.part(new THREE.SphereGeometry(0.07, 7, 5), BRASSP, { at: [x, 0.058, 0.215], scale: [1.05, 0.7, 0.95], bone: toe, name: `toeCap${S}` });
    b.extrude(
      [
        [-0.075, -0.13],
        [0.075, -0.13],
        [0.085, -0.02],
        [0.09, 0.07],
        [-0.09, 0.07],
        [-0.085, -0.02],
      ],
      { at: [x, 0.015, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, smoothing: 1, color: LEATHER_D, bone: ankle, name: `soleBack${S}` },
    );
    b.extrude(
      [
        [-0.09, 0.07],
        [0.09, 0.07],
        [0.075, 0.2],
        [0.04, 0.265],
        [-0.04, 0.265],
        [-0.075, 0.2],
      ],
      { at: [x, 0.015, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, smoothing: 1, color: LEATHER_D, bone: toe, name: `soleFront${S}` },
    );
    b.part(new THREE.BoxGeometry(0.17, 0.034, 0.05), LEATHER_D, { at: [x, 0.017, -0.115], bone: ankle, name: `heelBlock${S}` });
    // toe stitching / welt line
    b.rod([x - 0.085, 0.034, 0.0], [x - 0.09, 0.034, 0.1], 0.006, GOLD_D, { bone: toe, name: `weltOuter${S}` });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const C = V(0, 1.12, 0.02);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKINP, { at: C, scale: [0.135, 0.122, 0.13], bone: head, name: "skull" });
  const skin = b.surface(skull);
  b.part(new THREE.SphereGeometry(1, 10, 8), SKINP, { at: [0, 1.04, 0.07], scale: [0.105, 0.07, 0.1], bone: jaw, name: "jawBlock" });
  // nose
  b.part(new THREE.SphereGeometry(1, 9, 7), RUDDY, { at: [0, 1.087, 0.155], scale: [0.04, 0.042, 0.042], bone: head, name: "nose" });
  b.rod([0, 1.13, 0.14], [0, 1.1, 0.158], 0.02, SKINP, { bone: head, name: "noseBridge" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 7, 5), RUDDY, { at: [s * 0.075, 1.07, 0.1], scale: [0.05, 0.04, 0.045], bone: head, name: "cheek" });
    b.part(new THREE.SphereGeometry(1, 6, 5), RUDDY, { at: [s * 0.022, 1.075, 0.172], scale: [0.019, 0.019, 0.019], bone: head, name: "nostril" });
    // eyebrows: inner low, outer high, bushy
    b.sweep(
      catmull([
        [s * 0.012, 1.163, 0.158],
        [s * 0.05, 1.172, 0.152],
        [s * 0.098, 1.19, 0.12],
      ]),
      [0.022, 0.012],
      { color: HAIR, caps: { start: "round", end: "point" }, bone: head, name: "brow" },
    );
    // eye: a painted decal beneath the brow
    const eh = skin.around(C).at(s * 24, 2)!;
    b.decal(skin, EYE, { at: eh, size: [0.062, 0.039], up: [0, 1, 0], roll: s * -4, mirror: s > 0, lift: 0.002, name: "eye" });
    // ear + earring
    const ear = b.extrude(
      [
        [-0.03, -0.035],
        [0.0, -0.045],
        [0.035, -0.02],
        [0.05, 0.03],
        [0.04, 0.09, "sharp"],
        [0.0, 0.05],
        [-0.03, 0.01],
      ],
      { at: [s * 0.128, 1.115, 0.0], x: [0, 0, 1], y: [s * 0.3, 1, 0], thickness: 0.014, bevel: 0.005, smoothing: 1, color: SKINP, bone: head, name: "ear" },
    );
    if (s < 0) b.part(new THREE.TorusGeometry(0.014, 0.0045, 4, 8), GOLD, { at: ear.local([0.0, -0.04, 0.0]), dir: [1, 0, 0], axis: "z", bone: head, name: "earring" });
    // sideburns
    b.part(new THREE.SphereGeometry(1, 8, 6), HAIR, { at: [s * 0.122, 1.08, 0.035], scale: [0.032, 0.07, 0.06], bone: head, name: "sideburn" });
    // moustache
    b.sweep(
      catmull([
        [s * 0.01, 1.07, 0.158],
        [s * 0.07, 1.048, 0.16],
        [s * 0.125, 1.015, 0.135],
        [s * 0.16, 1.03, 0.09],
        [s * 0.178, 1.065, 0.065],
      ]),
      [0.036, 0.03, 0.022, 0.012],
      { color: HAIR2, caps: { start: "round", end: "point" }, bone: head, name: "moustache" },
    );
    b.part(new THREE.TorusGeometry(0.013, 0.004, 4, 8), GOLD, { at: [s * 0.176, 1.045, 0.075], dir: [0, 0.2, 1], axis: "z", bone: head, name: "moustacheRing" });
  }
  // scar over the left brow
  b.decal(skin, svg(`<svg viewBox="0 0 24 64"><path d="M14 2 L10 24 L14 34 L9 62" stroke="#a24a46" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 22 L19 24 M5 40 L18 38" stroke="#d9a090" stroke-width="2.8" stroke-linecap="round"/></svg>`, { size: 96 }), {
    at: skin.around(C).at(26, 25)!,
    size: [0.02, 0.055],
    up: [0, 1, 0],
    roll: -12,
    lift: 0.002,
    name: "scar",
  });
  // hair tufts at the back and under the hat
  b.part(new THREE.SphereGeometry(1, 10, 8), HAIR, { at: [0, 1.13, -0.07], scale: [0.14, 0.115, 0.095], bone: head, name: "hairBack" });
  b.sweep(
    catmull([
      [0, 1.1, -0.12],
      [0, 1.0, -0.17],
      [0, 0.9, -0.17],
      [0, 0.8, -0.2],
    ]),
    [0.036, 0.03, 0.024, 0.018],
    { color: HAIR2, caps: { end: "round" }, bone: head, name: "ponytail" },
  );
  b.part(new THREE.TorusGeometry(0.036, 0.008, 4, 9), GOLD, { at: [0, 0.97, -0.172], dir: [0, 1, 0.1], axis: "z", bone: head, name: "ponytailTie" });

  // Beard: main mass on the jaw, braids hanging from it
  const beard = b.loft(
    [
      { at: [0, 1.065, 0.1], w: 0.27, h: 0.1 },
      { at: [0, 1.0, 0.17], w: 0.27, h: 0.14 },
      { at: [0, 0.9, 0.22], w: 0.25, h: 0.13 },
      { at: [0, 0.78, 0.235], w: 0.17, h: 0.1 },
      { at: [0, 0.66, 0.225], w: 0.07, h: 0.06 },
    ],
    { bone: jaw, color: HAIR, name: "beard" },
  );
  {
    const hits = b.surface(beard).scatter(150, { rng: rng(5), minDist: 0.03, filter: (h) => h.n.z > -0.1 });
    b.cards(hits, TUFT, { size: [0.04, 0.075], lean: 55, flow: [0, -1, 0.15], bend: 18, vary: 0.3, rng: rng(6), bone: jaw });
  }
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ch = b.chain(
      `braid${S}`,
      catmull([
        [s * 0.065, 0.995, 0.225],
        [s * 0.068, 0.86, 0.262],
        [s * 0.064, 0.72, 0.27],
        [s * 0.064, 0.585, 0.278],
      ]),
      { parent: jaw, names: [`braid${S}1`, `braid${S}2`, `braid${S}3`] },
    );
    b.sweep(ch, [0.028, 0.026, 0.022], { color: hair(BEARD_D, BEARD, BEARD_D), name: `braidCore${S}` });
    let k = 0;
    b.along(ch, 14, (at) => {
      const tilt = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), (k++ % 2 ? 1 : -1) * 0.62);
      b.part(new THREE.SphereGeometry(1, 7, 5), k % 2 ? HAIR : HAIR2, {
        frame: at,
        quat: at.quat.clone().multiply(tilt),
        scale: [0.04, 0.024, 0.03 - at.t * 0.005],
        name: `plait${S}`,
      });
    });
    const tip = ch.at(1).at;
    b.part(new THREE.TorusGeometry(0.025, 0.0085, 5, 9), GOLD, { at: [tip.x, tip.y + 0.02, tip.z], dir: [0, 1, 0], axis: "z", bone: ch.joints[2], name: `braidRing${S}` });
    b.spike([tip.x, tip.y + 0.01, tip.z], [0, -1, 0], 0.075, 0.026, { color: HAIR2, bone: ch.joints[2], name: `braidTuft${S}` });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), RED, { at: [tip.x, tip.y + 0.03, tip.z + 0.02], bone: ch.joints[2], name: `braidBead${S}` });
  }
  // beard clasp: ring bands on the central beard
  b.part(new THREE.TorusGeometry(0.052, 0.01, 5, 10), GOLD, { at: [0, 0.76, 0.225], dir: [0, 1, 0], axis: "z", scale: [1, 1, 1], bone: jaw, name: "beardRing" });

  // Hat: tricorn with brass badge and plume
  {
    const crownBase = 1.188;
    b.lathe(
      [
        [0, 0],
        [0.125, 0],
        [0.13, 0.01],
        [0.12, 0.1],
        [0.098, 0.12],
        [0, 0.12],
      ],
      { at: [0, crownBase, 0.015], bone: head, segments: 12, smoothing: 1, color: FELTP, name: "hatCrown" },
    );
    b.lathe(
      [
        [0.11, -0.008],
        [0.2, -0.012],
        [0.21, 0.004],
        [0.2, 0.012],
        [0.11, 0.016],
      ],
      { at: [0, crownBase + 0.005, 0.015], bone: head, segments: 14, color: FELTP, name: "hatBrim" },
    );
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const outward = V(Math.sin(a), 0, Math.cos(a));
      const tang = V(Math.cos(a), 0, -Math.sin(a));
      const ydir = outward.clone().multiplyScalar(Math.cos(0.5)).add(V(0, Math.sin(0.5), 0));
      b.extrude(
        [
          [-0.09, 0],
          [0.09, 0],
          [0.125, 0.11],
          [0.0, 0.2, "sharp"],
          [-0.125, 0.11],
        ],
        {
          at: V(0, crownBase + 0.01, 0.015).addScaledVector(outward, 0.16),
          x: tang,
          y: ydir,
          thickness: 0.014,
          bevel: 0.004,
          smoothing: 1,
          bone: head,
          color: hp(paint((p, n, sv) => (sv[1] > 0.185 || Math.abs(sv[0]) > 0.108 - sv[1] * 0.1 ? GOLD : resolve(FELTP, p, n))), 0.2),
          name: `hatCorner${i}`,
        },
      );
    }
    b.part(new THREE.TorusGeometry(0.128, 0.011, 4, 14), LEATHER_D, { at: [0, crownBase + 0.03, 0.015], dir: [0, 1, 0], axis: "z", bone: head, name: "hatBand" });
    b.extrude(
      [
        [0, -0.04],
        [0.034, -0.01],
        [0.03, 0.03],
        [0, 0.05],
        [-0.03, 0.03],
        [-0.034, -0.01],
      ],
      { at: [0, crownBase + 0.045, 0.146], x: [1, 0, 0], thickness: 0.012, bevel: 0.003, color: GOLDP, bone: head, name: "hatBadge" },
    );
    b.part(new THREE.SphereGeometry(0.014, 6, 5), RED, { at: [0, crownBase + 0.047, 0.156], bone: head, name: "hatGem" });
    const feathers = [
      { at: [0.1, crownBase + 0.095, 0.0], flow: [0.7, 0.2, -0.6], lean: 45 },
      { at: [0.1, crownBase + 0.09, 0.0], flow: [0.9, 0.1, 0.2], lean: 55 },
      { at: [0.105, crownBase + 0.085, -0.01], flow: [0.5, -0.1, -0.9], lean: 62 },
    ];
    feathers.forEach((f, i) => {
      b.cards([frame(f.at, [0.35, 1, 0.1 * (i - 1)])], PLUME, { size: [0.07, 0.24 - i * 0.03], lean: f.lean, flow: f.flow, bend: 38, bone: head, cross: false });
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Blunderbuss
  const handR = wristR;
  const wpart = (geo: THREE.BufferGeometry, color: string | Paint, p: number[], o: { along?: boolean; scale?: number[]; name?: string } = {}) =>
    b.part(geo, color, {
      at: W(p[0], p[1], p[2]),
      quat: o.along ? wq.clone().multiply(qAlong) : wq,
      scale: o.scale,
      bone: handR,
      name: o.name,
    });
  // stock
  b.extrude(
    [
      [-0.3, 0.105],
      [-0.3, -0.075],
      [-0.22, -0.058],
      [-0.12, -0.038],
      [-0.02, -0.035],
      [0.1, -0.03],
      [0.2, -0.028],
      [0.2, 0.06],
      [0.0, 0.065],
      [-0.1, 0.07],
      [-0.2, 0.095],
    ],
    { at: W(0, 0, 0), x: WD(0, 0, 1), y: WD(0, 1, 0), thickness: 0.05, bevel: 0.01, smoothing: 1, color: WOODP, bone: handR, name: "stock" },
  );
  // pistol grip
  b.rod(W(0, 0.045, gz(0.045)), W(0, -0.11, gz(-0.11)), 0.028, WOODP, { sides: 8, bone: handR, name: "grip" });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), BRASSP, { at: W(0, -0.115, gz(-0.115)), bone: handR, name: "gripCap" });
  // barrel (octagonal steel, tapered), muzzle bell
  b.rod(W(0, 0.085, -0.07), W(0, 0.085, 0.33), [0.036, 0.03], STEELP, { sides: 8, bone: handR, name: "barrel" });
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.04), STEELP, { at: W(0, 0.085, -0.075), quat: wq, bone: handR, name: "breechPlug" });
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.05],
      [0.058, 0.14],
      [0.09, 0.235],
      [0.09, 0.248],
      [0.072, 0.248],
      [0.05, 0.17],
      [0, 0.12],
    ],
    {
      at: W(0, 0.085, 0.32),
      axis: F,
      segments: 12,
      bone: handR,
      color: hp(paint((p, n, sv) => (n.dot(F) > 0.15 ? INK : sv[0] > 0.215 ? GOLD : resolve(BRASSP, p, n))), 0.3),
      name: "muzzleBell",
    },
  );
  for (const z of [0.0, 0.08, 0.17, 0.3]) {
    wpart(new THREE.TorusGeometry(0.037 - z * 0.02, 0.0085, 4, 10), z === 0.17 ? GOLDP : BRASSP, [0, 0.085, z], { name: "barrelBand" });
  }
  // fore-stock bands
  for (const z of [0.07, 0.165]) {
    wpart(new THREE.BoxGeometry(0.058, 0.118, 0.014), BRASSP, [0, 0.012, z], { name: "foreBand" });
  }
  // rune plate on top
  b.part(new THREE.PlaneGeometry(0.032, 0.032), "#ffffff", { at: W(0, 0.118, 0.22), dir: WD(0, 1, 0), axis: "z", up: F, texture: RUNE, bone: handR, name: "barrelRune" });
  // butt plate
  b.extrude(
    [
      [-0.04, -0.09],
      [0.04, -0.09],
      [0.04, 0.1],
      [0.0, 0.118, "sharp"],
      [-0.04, 0.1],
    ],
    { at: W(0, 0.0, -0.306), x: WD(1, 0, 0), y: WD(0, 1, 0), thickness: 0.014, bevel: 0.004, smoothing: 0, color: BRASSP, bone: handR, name: "buttPlate" },
  );
  // lock
  b.extrude(
    [
      [-0.09, 0.0],
      [-0.03, 0.075],
      [0.1, 0.068],
      [0.115, 0.03],
      [0.05, 0.0],
    ],
    { at: W(0.0265, -0.005, 0.0), x: WD(0, 0, 1), y: WD(0, 1, 0), thickness: 0.009, bevel: 0.003, smoothing: 1, color: STEELP, bone: handR, name: "lockPlate" },
  );
  b.sweep(
    bezier(W(0.036, 0.04, -0.04), W(0.04, 0.12, -0.05), W(0.04, 0.17, -0.0), W(0.036, 0.14, 0.04)),
    [0.014, 0.008],
    { color: STEELP, caps: { start: "round", end: "flat" }, bone: handR, name: "hammer" },
  );
  b.part(new THREE.BoxGeometry(0.02, 0.012, 0.034), BRASSP, { at: W(0.034, 0.1, 0.055), quat: wq, bone: handR, name: "flashPan" });
  b.rod(W(0.034, 0.108, 0.075), W(0.034, 0.17, 0.085), [0.008, 0.012], STEELP, { sides: 4, bone: handR, name: "frizzen" });
  for (const [z, y] of [[-0.06, 0.03], [0.07, 0.02]]) {
    b.part(new THREE.CylinderGeometry(0.0095, 0.0095, 0.008, 7), BRASS, {
      at: W(0.0335, y, z),
      dir: WD(1, 0, 0),
      name: "lockScrew",
      bone: handR,
    });
  }
  // trigger guard + trigger
  b.sweep(
    catmull([W(0, -0.036, 0.0), W(0, -0.075, 0.015), W(0, -0.09, 0.05), W(0, -0.06, 0.088), W(0, -0.03, 0.09)]),
    0.0065,
    { color: BRASSP, bone: handR, name: "triggerGuard" },
  );
  b.spike(W(0, -0.03, 0.03), WD(0, -1, 0.3), 0.04, 0.007, { color: STEELP, bone: handR, name: "trigger" });
  // ramrod and pipes
  b.rod(W(0, -0.03, 0.2), W(0, -0.03, 0.33), 0.007, WOODP, { bone: handR, name: "ramrod" });
  b.sweep(
    catmull([W(0.0, -0.03, 0.18), W(0.0, -0.13, 0.12), W(0.0, -0.19, -0.03), W(0.0, -0.15, -0.18), W(0, -0.07, -0.27)]),
    () => [0.005, 0.016],
    { section: "box", color: LEATHERP, bone: handR, name: "sling" },
  );
  b.part(new THREE.TorusGeometry(0.013, 0.004, 4, 8), BRASS, { at: W(0, -0.036, 0.185), dir: WD(1, 0, 0), axis: "z", bone: handR, name: "swivelF" });
  b.part(new THREE.TorusGeometry(0.013, 0.004, 4, 8), BRASS, { at: W(0, -0.07, -0.265), dir: WD(1, 0, 0), axis: "z", bone: handR, name: "swivelB" });
  // inlays on both sides of the stock
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.17, 0.07), "#ffffff", {
      at: W(s * 0.0258, 0.025, -0.19),
      dir: WD(s, 0, 0),
      axis: "z",
      up: WD(0, 1, 0),
      texture: SCROLL,
      bone: handR,
      name: "stockInlay",
    });
  }
  // kill tallies
  for (let i = 0; i < 6; i++) wpart(new THREE.BoxGeometry(0.004, 0.03, 0.004), GOLD, [-0.0262, 0.06, -0.12 - i * 0.014], { name: "tally" });

  void R;
  return b.root;
}
