// Elven ranger archer, high-fantasy anime: cel-shaded (kits/toon), gold trims, teal elemental glow (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { catmull } from "../../../../src/path";
import { grain, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Elven Ranger Archer",
  description:
    "Tall elven ranger in a leaf-green tunic and flowing cloak, long braid over one shoulder, gold circlet, back quiver with glowing-fletched arrows and a runed longbow planted at her side.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);

export default function build() {
  const b = createBuilder({ name: "elvenArcher" });

  // ---------------------------------------------------------------- palette
  const SKIN = cel("#fbdcc9", "#e8a8a2");
  const HAIR = cel(grain("#fbf4dc", "#e9dfbc", { size: 0.012, axis: "y" }), "#b9aa8c");
  const HAIR_B = cel("#e2d4a8", "#a99a78");
  const TUNIC = cel("#3f9b63");
  const TUNIC_2 = cel("#37905a");
  const TUNIC_D = cel("#2c6e4c");
  const CREAM = cel("#f4ecd4", "#cfc3a8");
  const LEATHER = cel("#a56a3a");
  const LEATHER_D = cel("#6a4026");
  const BOOT = cel("#7c4b2c", "#4f2d24");
  const LEG = cel("#5a7d4f");
  const GOLD = cel("#f4bb3a", "#c7802a");
  const WOOD = cel("#d6a95f", "#a8733f");
  const CLOAK_A = cel("#2f8a5c");
  const CLOAK_B = cel("#256c4a");
  const CLOAK_T = cel("#1d4f3a");
  const TEAL = "#5af5d0";
  const RIBBON = "#2db8a0";
  const STRING = "#f6f0da";
  const SHAFT = "#e3cf9c";
  const LIP = "#d9858a";

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.97, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.98, 0],
      [0, 1.12, 0.005],
      [0, 1.27, 0.012],
      [0, 1.41, 0.012],
    ],
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.joints[3];
  const neck = b.chain(
    "neck",
    [
      [0, 1.47, 0.012],
      [0, 1.56, 0.022],
      [0, 1.64, 0.04],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.64, 0.04], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.7, 0.02], aim: [0, 1.675, 0.12], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torsoPaint = paint((p) =>
    p.y > 1.455 ? CREAM : Math.abs(p.x) > 0.14 && p.y > 1.3 ? TUNIC_D : p.y < 1.05 ? LEG : TUNIC,
  );
  const torso = b.loft(
    [
      { at: [0, 0.98, 0], w: 0.26, h: 0.19 },
      { at: [0, 1.12, 0.005], w: 0.235, h: 0.17 },
      { at: [0, 1.26, 0.014], w: 0.29, h: 0.2 },
      { at: [0, 1.37, 0.014], w: 0.345, h: 0.21 },
      { at: [0, 1.45, 0.012], w: 0.27, h: 0.17 },
      { at: [0, 1.51, 0.012], w: 0.13, h: 0.12 },
    ],
    { bone: spine, color: torsoPaint },
  );
  const torsoSurf = b.surface(torso);

  b.sweep(neck, [0.05, 0.044], { color: SKIN, sides: 10 });

  // lacing and gold vine embroidery down the jerkin front
  let laces = "";
  for (let i = 0; i < 10; i++) {
    const y = 16 + i * 12.5;
    laces += `<path d="M36 ${y} L64 ${y + 10} M64 ${y} L36 ${y + 10}" stroke="#f4ecd4" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  }
  let leaves = "";
  for (let i = 0; i < 6; i++) {
    const y = 24 + i * 20;
    leaves += `<ellipse cx="${i % 2 ? 10 : 18}" cy="${y}" rx="5.5" ry="2.6" fill="#f4bb3a" transform="rotate(-40 ${i % 2 ? 10 : 18} ${y})"/>`;
    leaves += `<ellipse cx="${i % 2 ? 90 : 82}" cy="${y}" rx="5.5" ry="2.6" fill="#f4bb3a" transform="rotate(40 ${i % 2 ? 90 : 82} ${y})"/>`;
  }
  const LACE = svg(
    `<svg viewBox="0 0 100 150">
      <path d="M50 6 L50 144" stroke="#3a2a1c" stroke-width="4" fill="none"/>
      ${laces}
      <path d="M14 6 C4 40 24 60 12 90 C4 115 20 130 14 146" stroke="#f4bb3a" stroke-width="3.5" fill="none"/>
      <path d="M86 6 C96 40 76 60 88 90 C96 115 80 130 86 146" stroke="#f4bb3a" stroke-width="3.5" fill="none"/>
      ${leaves}
    </svg>`,
    { size: 384 },
  );
  b.decal(torsoSurf, LACE, { at: [0, 1.27, 0.12], dir: [0, 0, 1], size: [0.17, 0.26] });

  // collar
  b.sweep(torsoSurf.loop([0, 1.49, 0], { lift: 0.004 }), 0.014, { color: CREAM, sides: 8 });

  // belt, studs, buckle, pouches
  b.sweep(torsoSurf.loop([0, 1.1, 0], { lift: 0.01 }), 0.02, { color: LEATHER_D, sides: 8 });
  b.along(torsoSurf.loop([0, 1.1, 0], { lift: 0.033 }), 16, (at) =>
    b.part(sph(0.008, 6, 4), GOLD, { at }),
  );
  const buckle = torsoSurf.ray([0, 1.1, 1], [0, 0, -1]);
  if (buckle) {
    b.stick(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 8), GOLD, buckle.moved([0, 0.03, 0]), { embed: 0.2 });
    glow(b.stick(sph(0.012, 6, 4), TEAL, buckle.moved([0, 0.046, 0]), { embed: 0.3 }), 1.2);
  }
  const pouchHit = torsoSurf.around([0, 1.1, 0]).at(66, 0);
  const flapHit = torsoSurf.around([0, 1.1, 0]).at(66, 14);
  if (pouchHit) b.stick(new THREE.BoxGeometry(0.07, 0.05, 0.075), LEATHER, pouchHit, { embed: 0.25 });
  if (flapHit) b.stick(new THREE.BoxGeometry(0.076, 0.056, 0.034), LEATHER_D, flapHit, { embed: 0.25 });
  const pouch2 = torsoSurf.around([0, 1.1, 0]).at(104, -3);
  if (pouch2) b.stick(new THREE.BoxGeometry(0.05, 0.04, 0.055), LEATHER, pouch2, { embed: 0.25 });

  // tunic skirt
  const SKIRT: OutlinePoint[] = [
    [0.14, 0],
    [0.165, 0],
    [0.29, -0.36],
    [0.272, -0.365],
  ];
  const skirtPaint = paint((p, _n, s) => {
    const tooth = 0.745 + 0.03 * zigzag(s[1] / 22.5);
    if (p.y < tooth) return p.y < tooth - 0.016 ? GOLD : TUNIC_D;
    return Math.floor(s[1] / 22.5) % 2 ? TUNIC : TUNIC_2;
  });
  b.lathe(SKIRT, { at: [0, 1.06, 0], segments: 16, color: skirtPaint, bone: hips });

  // dagger on the right hip
  const dg = v(-0.386, -0.912, -0.14).normalize();
  const sheathA = v(-0.17, 1.04, 0.04);
  const sheathB = v(-0.28, 0.78, 0.0);
  b.rod(sheathA, sheathB, [0.018, 0.012], LEATHER_D, { bone: hips, sides: 8 });
  b.rod(sheathA.clone().addScaledVector(dg, -0.02), sheathA.clone().addScaledVector(dg, 0.07), 0.022, GOLD, {
    bone: hips,
    sides: 6,
    caps: "round",
  });
  b.capsule(
    sheathA.clone().addScaledVector(dg, -0.025),
    sheathA.clone().addScaledVector(dg, -0.095),
    0.012,
    LEATHER,
    { bone: hips, sides: 6 },
  );
  b.part(sph(0.015, 6, 4), TEAL, { at: sheathA.clone().addScaledVector(dg, -0.1), bone: hips });
  b.rod(sheathB, sheathB.clone().addScaledVector(dg, 0.05), 0.013, GOLD, { bone: hips, sides: 6 });

  // ---------------------------------------------------------------- legs
  const legPaint = paint((p) => (p.y < 0.395 ? BOOT : LEG));
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.09, 0.95, 0], [s * 0.1, 0.09, 0], [0.46, 0.46], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.02],
    });
    const ankle = leg.joints[2];
    const toe = b.joint(`toe${L}`, {
      parent: ankle,
      at: [s * 0.1, 0.06, 0.12],
      aim: [s * 0.1, 0.05, 0.25],
      role: "digit",
    });
    const legMesh = b.sweep(leg, [0.082, 0.068, 0.057, 0.052, 0.043], { color: legPaint, sides: 10 });
    const legSurf = b.surface(legMesh);
    b.sweep(legSurf.loop(leg.at(0.64), { lift: 0.006 }), 0.012, { color: LEATHER, sides: 8 });
    b.sweep(legSurf.loop(leg.at(0.6), { lift: 0.004 }), 0.006, { color: GOLD, sides: 6 });
    b.sweep(
      [
        [s * 0.1, 0.054, -0.045],
        [s * 0.1, 0.05, 0.125],
      ],
      [0.052, 0.046],
      { color: BOOT, bone: ankle, sides: 8 },
    );
    b.sweep(
      catmull([
        [s * 0.1, 0.05, 0.12],
        [s * 0.1, 0.046, 0.19],
        [s * 0.1, 0.066, 0.255],
      ]),
      [0.044, 0.03, 0.012],
      { color: LEATHER_D, bone: toe, sides: 8, caps: "point" },
    );
    // heel block and gold anklet
    b.part(new THREE.BoxGeometry(0.07, 0.02, 0.05), LEATHER_D, { at: [s * 0.1, 0.012, -0.03], bone: ankle });
    b.sweep(legSurf.loop(leg.at(0.93), { lift: 0.004 }), 0.007, { color: GOLD, sides: 6 });
    glow(b.part(sph(0.009, 6, 4), TEAL, { at: [s * 0.1 + s * 0.046, 0.12, 0.0], bone: ankle }), 1);
  }

  // ---------------------------------------------------------------- cloak
  const cloakPaint = paint((_p, _n, s) => {
    const tooth = 0.9 + 0.045 * zigzag(s[0] * 18);
    if (s[1] > tooth + 0.02) return GOLD;
    if (s[1] > tooth) return CLOAK_T;
    return Math.sin(s[0] * Math.PI * 22 + s[1] * 2) > 0.3 ? CLOAK_B : CLOAK_A;
  });
  b.membrane(
    [
      [0.22, 1.455, -0.06],
      [0.14, 1.5, -0.095],
      [0.07, 1.515, -0.105],
      [0, 1.52, -0.108],
      [-0.07, 1.515, -0.105],
      [-0.14, 1.5, -0.095],
      [-0.22, 1.455, -0.06],
    ],
    [
      [0.38, 0.55, -0.2],
      [0.25, 0.5, -0.3],
      [0.12, 0.48, -0.35],
      [0, 0.47, -0.36],
      [-0.12, 0.48, -0.35],
      [-0.25, 0.5, -0.3],
      [-0.38, 0.55, -0.2],
    ],
    { color: cloakPaint, thickness: 0.012, rows: 8, cols: 18, bone: chest },
  );
  b.part(sph(1, 10, 7), CLOAK_B, { at: [0, 1.5, -0.095], scale: [0.115, 0.05, 0.065], bone: chest });

  // cloak clasps with a chain and a glowing pendant
  for (const s of [1, -1]) {
    b.part(sph(0.015, 8, 6), GOLD, { at: [s * 0.085, 1.485, 0.045], bone: chest });
    glow(b.part(sph(0.008, 6, 4), TEAL, { at: [s * 0.085, 1.49, 0.058], bone: chest }), 1.2);
  }
  b.sweep(
    catmull([
      [0.085, 1.485, 0.045],
      [0.06, 1.455, 0.092],
      [0.03, 1.435, 0.107],
      [0, 1.43, 0.11],
      [-0.03, 1.435, 0.107],
      [-0.06, 1.455, 0.092],
      [-0.085, 1.485, 0.045],
    ]),
    0.0035,
    { color: GOLD, bone: chest, sides: 6 },
  );
  b.part(sph(1, 8, 6), GOLD, { at: [0, 1.41, 0.108], scale: [0.016, 0.021, 0.008], bone: chest });
  glow(b.part(sph(1, 8, 6), TEAL, { at: [0, 1.41, 0.114], scale: [0.011, 0.016, 0.007], bone: chest }), 1.4);

  // ---------------------------------------------------------------- arms and hands
  const wrists: Record<string, ReturnType<typeof b.joint>> = {};
  const armSkin = paint((p) => (p.y > 1.18 ? TUNIC : p.y > 0.99 ? CREAM : SKIN));
  const dome = (k: number): OutlinePoint[] => [
    [0, 0.056 * k],
    [0.04 * k, 0.048 * k],
    [0.068 * k, 0.02 * k],
    [0.075 * k, -0.005 * k],
    [0.066 * k, -0.008 * k],
    [0.035 * k, 0.034 * k],
    [0, 0.044 * k],
  ];
  const rim = (k: number): OutlinePoint[] => [
    [0.071 * k, -0.012 * k],
    [0.082 * k, -0.012 * k],
    [0.082 * k, -0.001 * k],
    [0.071 * k, -0.001 * k],
  ];
  const PLATE = cel("#3e8b5b", "#2b6446");

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const S: [number, number, number] = [s * 0.21, 1.4, 0];
    const E: [number, number, number] = s > 0 ? [0.33, 1.15, -0.01] : [-0.33, 1.15, -0.02];
    const W: [number, number, number] = s > 0 ? [0.4, 0.93, 0.15] : [-0.4, 0.92, 0.06];
    const arm = b.chain(`arm${L}`, catmull([S, E, W]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const wrist = arm.joints[2];
    wrists[L] = wrist;
    const armMesh = b.sweep(arm, [0.052, 0.047, 0.04, 0.034, 0.03], { color: armSkin, sides: 10 });
    const armSurf = b.surface(armMesh);
    b.sweep(armSurf.loop(arm.at(0.56), { lift: 0.005 }), 0.007, { color: GOLD, sides: 6 });
    for (const t of [0.64, 0.69, 0.74, 0.79, 0.84])
      b.sweep(armSurf.loop(arm.at(t), { lift: 0.006 }), 0.0085, { color: LEATHER, sides: 8 });
    b.sweep(armSurf.loop(arm.at(0.6), { lift: 0.005 }), 0.006, { color: GOLD, sides: 6 });
    b.sweep(armSurf.loop(arm.at(0.88), { lift: 0.005 }), 0.006, { color: GOLD, sides: 6 });
    glow(b.part(new THREE.OctahedronGeometry(0.01), TEAL, { at: armSurf.ray([s * 0.6, 1.02, 0.05], [-s, 0, 0])?.at ?? [s * 0.42, 1.02, 0.05], bone: wrist }), 1.2);

    // pauldron: three stacked leaf plates with gold rims
    const plates: Array<[number, number, number, number, number]> = [
      [0.205, 1.43, 0.45, 1, 0],
      [0.245, 1.4, 0.9, 1.2, 0],
      [0.28, 1.36, 1.5, 1.4, 0],
    ];
    for (const [px, py, tilt, k] of plates) {
      b.lathe(dome(k), { at: [s * px, py, 0], axis: [s * tilt, 1, 0], segments: 10, color: PLATE, bone: shoulder });
      b.lathe(rim(k), { at: [s * px, py, 0], axis: [s * tilt, 1, 0], segments: 10, color: GOLD, bone: shoulder });
    }

    // hand
    const wV = new THREE.Vector3(...W);
    const dd = wV.clone().sub(new THREE.Vector3(...E)).normalize();
    const pN = new THREE.Vector3(-s, 0, 0);
    pN.addScaledVector(dd, -pN.dot(dd)).normalize();
    const wide = new THREE.Vector3().crossVectors(pN, dd).multiplyScalar(s).normalize();
    b.capsule(wV, wV.clone().addScaledVector(dd, 0.085), [0.028, 0.024], SKIN, { bone: wrist, sides: 8 });
    const curlK = s > 0 ? 1 : 0.6;
    const fingers: Array<[string, number, number[]]> = [
      ["index", 0.024, [0.034, 0.026, 0.02]],
      ["middle", 0.008, [0.037, 0.028, 0.021]],
      ["ring", -0.008, [0.034, 0.026, 0.019]],
      ["pinky", -0.024, [0.027, 0.02, 0.016]],
    ];
    const curl = [0.35 * curlK, 0.9 * curlK, 1.3 * curlK];
    for (const [name, off, lens] of fingers) {
      const pts: THREE.Vector3[] = [wV.clone().addScaledVector(dd, 0.08).addScaledVector(wide, off)];
      for (let k = 0; k < 3; k++) {
        const dir = dd.clone().multiplyScalar(Math.cos(curl[k])).addScaledVector(pN, Math.sin(curl[k])).normalize();
        pts.push(pts[k].clone().addScaledVector(dir, lens[k]));
      }
      const ch = b.chain(`${name}${L}`, pts, {
        parent: wrist,
        names: [`${name}1${L}`, `${name}2${L}`, `${name}3${L}`],
        role: "digit",
      });
      b.sweep(ch, [0.0095, 0.0065], { color: SKIN, sides: 6 });
    }
    // thumb
    const tBase = wV.clone().addScaledVector(dd, 0.035).addScaledVector(wide, 0.03);
    const tDir = dd.clone().multiplyScalar(0.75).addScaledVector(wide, 0.45).normalize();
    const tPts: THREE.Vector3[] = [tBase];
    const tLens = [0.03, 0.026, 0.021];
    const tCurl = [0.2, 0.5, 0.8];
    for (let k = 0; k < 3; k++) {
      const dir = tDir.clone().multiplyScalar(Math.cos(tCurl[k])).addScaledVector(pN, Math.sin(tCurl[k])).normalize();
      tPts.push(tPts[k].clone().addScaledVector(dir, tLens[k]));
    }
    const thumb = b.chain(`thumb${L}`, tPts, {
      parent: wrist,
      names: [`thumb1${L}`, `thumb2${L}`, `thumb3${L}`],
      role: "digit",
    });
    b.sweep(thumb, [0.0115, 0.0075], { color: SKIN, sides: 6 });
  }

  // ---------------------------------------------------------------- head
  const HEAD_C: [number, number, number] = [0, 1.745, 0.04];
  const skull = b.part(sph(1, 16, 12), SKIN, { bone: head, at: HEAD_C, scale: [0.085, 0.105, 0.1] });
  b.part(sph(1, 12, 8), SKIN, { bone: jaw, at: [0, 1.668, 0.07], scale: [0.05, 0.032, 0.058] });
  b.part(sph(1, 8, 6), SKIN, { bone: jaw, at: [0, 1.648, 0.1], scale: [0.02, 0.016, 0.018] });
  b.capsule([-0.012, 1.676, 0.123], [0.012, 1.676, 0.123], 0.0055, LIP, { bone: jaw, sides: 6 });
  b.sweep(
    catmull([
      [-0.017, 1.69, 0.12],
      [0, 1.685, 0.125],
      [0.017, 1.69, 0.12],
    ]),
    0.0033,
    { color: INK, bone: head, sides: 5 },
  );
  b.spike([0, 1.715, 0.132], [0, -0.25, 1], 0.024, 0.008, SKIN, { bone: head, sides: 6 });

  const EYE = animeEye({ iris: "#2fd39b" });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 28, -4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.056, 0.076], mirror: s > 0 });
  }

  // ears and earrings
  const EAR: OutlinePoint[] = [
    [0, -0.028],
    [0.05, -0.012],
    [0.15, 0.075, "sharp"],
    [0.07, 0.045],
    [0.01, 0.03],
  ];
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: [s * 0.08, 1.735, 0.015],
      x: [s * 0.45, 0, -1],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: SKIN,
      bone: head,
    });
    b.part(sph(0.008, 6, 4), GOLD, { at: [s * 0.088, 1.706, 0.02], bone: head });
    glow(b.part(sph(0.007, 6, 4), TEAL, { at: [s * 0.09, 1.688, 0.02], bone: head }), 1.2);
  }

  // ---------------------------------------------------------------- hair
  b.part(sph(1, 14, 10), HAIR, { bone: head, at: [0, 1.768, -0.022], scale: [0.098, 0.106, 0.112] });
  b.sweep(
    [
      [0, 1.8, -0.1],
      [0, 1.7, -0.125],
      [0, 1.61, -0.115],
    ],
    (t) => [0.085 - 0.035 * t, 0.055 - 0.02 * t],
    { color: HAIR, bone: head, sides: 10 },
  );
  for (const x of [-0.07, -0.035, 0, 0.035, 0.07])
    b.spike([x, 1.63, -0.115], [x * 0.8, -1, -0.15], 0.12, 0.02, HAIR, { bone: head, sides: 6 });

  const skullZ = (x: number, y: number) =>
    0.04 + 0.1 * Math.sqrt(Math.max(0, 1 - (x / 0.085) ** 2 - ((y - 1.745) / 0.105) ** 2));
  for (const x of [-0.078, -0.055, -0.032, -0.012, 0.012, 0.032, 0.055, 0.078]) {
    const sign = x > 0 ? 1 : -1;
    const q = (k: number, y: number, e: number): [number, number, number] => [x * k, y, skullZ(x * k, y) + e];
    b.sweep(catmull([q(0.85, 1.862, 0.006), q(0.95, 1.835, 0.012), q(1, 1.8, 0.014), [x * 1.05 + sign * 0.01, 1.776, skullZ(x, 1.78) + 0.018]]), [0.015, 0.014, 0.01, 0.002], {
      color: HAIR,
      bone: head,
      sides: 6,
    });
  }
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.078, 1.8, 0.075],
        [s * 0.092, 1.74, 0.07],
        [s * 0.096, 1.66, 0.075],
        [s * 0.088, 1.585, 0.09],
      ]),
      [0.02, 0.017, 0.012, 0.003],
      { color: HAIR, bone: head, sides: 6 },
    );
    b.sweep(
      catmull([
        [s * 0.07, 1.805, 0.09],
        [s * 0.083, 1.76, 0.095],
        [s * 0.085, 1.7, 0.1],
        [s * 0.078, 1.64, 0.112],
      ]),
      [0.012, 0.01, 0.007, 0.002],
      { color: HAIR_B, bone: head, sides: 6 },
    );
  }

  // circlet
  const ring: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ring.push([0.074 * Math.sin(a), 1.8 + 0.012 * ((1 - Math.cos(a)) / 2), 0.04 + 0.088 * Math.cos(a)]);
  }
  b.sweep(catmull(ring, { closed: true }), 0.0055, { color: GOLD, bone: head, sides: 6 });
  b.part(new THREE.OctahedronGeometry(0.012), GOLD, { at: [0, 1.803, 0.133], bone: head, scale: [1, 1.3, 0.8] });
  glow(b.part(sph(0.008, 6, 4), TEAL, { at: [0, 1.803, 0.141], bone: head }), 1.5);

  // braid over the left shoulder
  const braidPaint = paint((_p, _n, s) => (zigzag(s[0] * 16) > 0.5 ? HAIR : HAIR_B));
  const braid = b.chain(
    "braid",
    catmull([
      [0.05, 1.69, -0.115],
      [0.12, 1.64, -0.09],
      [0.17, 1.55, 0.0],
      [0.15, 1.43, 0.115],
      [0.13, 1.3, 0.125],
      [0.115, 1.17, 0.115],
    ]),
    { parent: head, role: "tail" },
  );
  const braidR = (t: number) => 0.03 - 0.019 * t;
  b.sweep(braid, braidR, { color: braidPaint, sides: 8 });
  for (const t of [0.35, 0.64, 0.95]) {
    const bp = braid.at(t);
    b.part(new THREE.CylinderGeometry(braidR(t) + 0.004, braidR(t) + 0.004, 0.014, 8), GOLD, { frame: bp });
  }
  b.spike(braid.at(1), braid.at(1), 0.06, 0.016, HAIR, { sides: 6 });

  // ---------------------------------------------------------------- quiver and arrows
  const Q0 = v(-0.1, 0.88, -0.3);
  const Q1 = v(0.06, 1.44, -0.19);
  const qa = Q1.clone().sub(Q0).normalize();
  b.rod(Q0, Q1, [0.05, 0.066], LEATHER, {
    bone: chest,
    sides: 10,
    bands: [
      [0.06, GOLD],
      [0.12, LEATHER_D],
      [0.86, LEATHER],
      [0.9, GOLD],
      [0.97, LEATHER_D],
    ],
  });
  b.spike(Q0, qa.clone().negate(), 0.07, 0.05, LEATHER_D, { bone: chest, sides: 10 });
  b.part(new THREE.CircleGeometry(0.063, 10), "#1c1218", {
    at: Q1.clone().addScaledVector(qa, 0.002),
    dir: qa,
    axis: "z",
    bone: chest,
  });
  const qu = new THREE.Vector3().crossVectors(qa, v(0, 0, 1)).normalize();
  const qv = new THREE.Vector3().crossVectors(qa, qu).normalize();
  const FEATHER = svg(
    `<svg viewBox="0 0 40 100">
      <path d="M20 98 C4 80 2 40 20 2 C38 40 36 80 20 98Z" fill="#7df5d8"/>
      <path d="M20 96 L20 6" stroke="#ffffff" stroke-width="3.5" fill="none"/>
      <path d="M20 86 L7 66 M20 70 L6 48 M20 54 L9 32 M20 86 L33 66 M20 70 L34 48 M20 54 L31 32" stroke="#2fb89a" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 160 },
  );
  const arrowSpecs: Array<[number, number, number]> = [
    [-0.03, 0.005, 0.3],
    [0, 0.025, 0.34],
    [0.03, 0.0, 0.27],
    [0, -0.022, 0.31],
    [-0.016, -0.012, 0.36],
    [0.016, 0.014, 0.29],
  ];
  const fletch = [];
  for (const [ou, ov, h] of arrowSpecs) {
    const lat = qu.clone().multiplyScalar(ou).addScaledVector(qv, ov);
    const bottom = Q1.clone().addScaledVector(qa, -0.12).add(lat);
    const top = Q1.clone().addScaledVector(qa, h).add(lat);
    b.rod(bottom, top, 0.0045, SHAFT, { bone: chest, sides: 5 });
    glow(b.part(sph(0.007, 5, 4), TEAL, { at: top.clone().addScaledVector(qa, 0.004), bone: chest }), 1.3);
    fletch.push(frame(top.clone().addScaledVector(qa, -0.085), qa));
  }
  b.cards(fletch, FEATHER, { size: [0.03, 0.075], cross: true, bone: chest });

  // quiver strap: over the cloak, across the shoulder, down the chest
  b.sweep(
    catmull([
      [0.0, 1.36, -0.2],
      [-0.05, 1.48, -0.135],
      [-0.085, 1.52, -0.07],
      [-0.09, 1.5, -0.02],
    ]),
    (): [number, number] => [0.014, 0.0065],
    { color: LEATHER_D, bone: chest },
  );
  b.sweep(
    torsoSurf.drape(
      catmull([
        [-0.09, 1.5, -0.02],
        [-0.08, 1.46, 0.07],
        [-0.04, 1.38, 0.12],
        [0.03, 1.28, 0.125],
        [0.09, 1.16, 0.11],
        [0.12, 1.08, 0.07],
      ]),
      { lift: 0.008 },
    ),
    (): [number, number] => [0.014, 0.0065],
    { color: LEATHER_D },
  );

  // ---------------------------------------------------------------- longbow in the left hand
  const lw = wrists.L;
  const BX = 0.382;
  const bowYZ: Array<[number, number]> = [
    [0.04, 0.09],
    [0.22, 0.125],
    [0.5, 0.168],
    [0.75, 0.184],
    [0.885, 0.186],
    [1.02, 0.184],
    [1.27, 0.17],
    [1.55, 0.13],
    [1.73, 0.09],
  ];
  b.sweep(
    catmull(bowYZ.map(([y, z]) => [BX, y, z])),
    [0.007, 0.012, 0.016, 0.019, 0.02, 0.019, 0.016, 0.012, 0.007],
    {
      color: WOOD,
      bone: lw,
      sides: 8,
      caps: "point",
      bands: [
        [0.035, GOLD],
        [0.16, WOOD],
        [0.175, GOLD],
        [0.4, WOOD],
        [0.415, GOLD],
        [0.44, WOOD],
        [0.56, LEATHER_D],
        [0.585, WOOD],
        [0.6, GOLD],
        [0.825, WOOD],
        [0.84, GOLD],
        [0.965, WOOD],
        [1, GOLD],
      ],
    },
  );
  b.rod([BX, 0.04, 0.09], [BX, 1.73, 0.09], 0.0032, STRING, { bone: lw, sides: 4 });
  for (const [y, z] of [
    [0.5, 0.19],
    [1.27, 0.192],
    [1.55, 0.152],
  ])
    glow(b.part(new THREE.OctahedronGeometry(0.011), TEAL, { at: [BX, y, z], bone: lw }), 1.4);
  for (const [dx, tx] of [
    [0.0, 0.0],
    [0.012, -0.03],
  ])
    b.sweep(
      catmull([
        [BX + dx, 0.97, 0.195],
        [BX + dx - 0.012, 0.85, 0.21],
        [BX + dx + tx, 0.7, 0.2],
        [BX + dx + tx + 0.01, 0.55, 0.215],
      ]),
      (t): [number, number] => [0.013 * (1 - t * 0.4), 0.0025],
      { color: RIBBON, bone: lw },
    );

  return b.root;
}
