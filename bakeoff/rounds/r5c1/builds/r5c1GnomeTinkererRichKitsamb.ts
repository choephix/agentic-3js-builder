import * as THREE from "three";
import {
  createBuilder,
  rng,
  offset,
  lerp,
  catmull,
  bezier,
  polyline,
  limb,
  mottle,
  stripes,
  grain,
  patches,
  spots,
  paint,
  svg,
} from "../../../../src/index";
import { gearTrain, gearGeometry, gaugeTexture, coil, metal, panelled, TINT } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A chubby red-hatted gnome inventor with goggles, a big white beard and an enormous backpack of clockwork gadgets: gear train, pressure gauge, rotor, telescope, horn, lantern and a rolled blueprint, standing on a mossy workshop base.",
};

type V = [number, number, number];
type Fill = string | ReturnType<typeof spots>;
const pair = (a: number, b: number): [number, number] => [a, b];
const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const deg = (r: number) => (r * 180) / Math.PI;
const tilt = (a: number) => ({
  x: [Math.cos(a), -Math.sin(a), 0] as V,
  y: [Math.sin(a), Math.cos(a), 0] as V,
});

export default function build() {
  const b = createBuilder({ name: "gnome_tinkerer", paintSize: 2048 });
  const R = rng(11);
  const G = 0.05; // base thickness, lifted at the end so the base rests on y = 0

  // ------------------------------------------------------------------ palette
  const SKIN = "#f2b48f";
  const NOSE = "#ec8479";
  const BEARD = "#f4f1e8";
  const DARK = "#2a1a12";
  const STITCH = "#f1dcae";
  const TRIM = "#e0b04a";
  const STEEL_C = "#9aa4b4";

  const HAT_P = stripes(mottle("#d2412f", "#c03a2a", { size: 0.06, seed: 2 }), "#a92f1e", {
    size: 0.055,
    axis: "y",
    width: 0.2,
    wobble: 0.9,
    seed: 8,
  });
  const TUNIC = mottle("#3f78a8", "#386b98", { size: 0.07, seed: 4 });
  const LEATHER = mottle("#8b5a34", "#72482a", { size: 0.03, seed: 5 });
  const LEATHER2 = mottle("#6b4326", "#5a371e", { size: 0.03, seed: 6 });
  const PANTS = stripes("#7a5a3a", "#69492c", { size: 0.035, axis: "y", width: 0.3, seed: 3 });
  const BOOT = mottle("#5a3a22", "#4b2f1b", { size: 0.03, seed: 7 });
  const PACK = patches("#5b3b24", "#7b5232", { size: 0.07, gap: 0.06, seed: 9 });
  const FLAP = patches("#43291a", "#5a3822", { size: 0.06, gap: 0.07, seed: 12 });
  const WOOD = grain("#b07a42", "#8a5a2e", { size: 0.012, axis: "y", seed: 2 });
  const BARK = grain("#6b4a2b", "#4d331b", { size: 0.012, axis: "y", seed: 4 });
  const STONE = mottle("#8f949c", "#6f757e", { size: 0.05, seed: 13 });
  const BRASS = metal("brass");
  const GILT = metal("gilt");
  const COPPER = metal("copper", { verdigris: 0.3 });
  const STEEL = metal("steel");
  const IRON = metal("iron");
  const TANK = panelled(metal("copper", { verdigris: 0.35, seed: 5 }), { size: 0.09, rivets: 0.02 });

  // ------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 40 48"><ellipse cx="20" cy="24" rx="17" ry="21" fill="#fff" stroke="#3a2418" stroke-width="3"/>
     <circle cx="21" cy="27" r="11" fill="#3b82a0"/><circle cx="21" cy="27" r="11" fill="none" stroke="#1d4a5e" stroke-width="2"/>
     <circle cx="21" cy="28" r="5.5" fill="#101820"/><circle cx="25" cy="22" r="3.6" fill="#fff"/><circle cx="17" cy="33" r="1.8" fill="#fff"/></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M3 64 C 6 36 12 14 18 0 C 24 18 30 38 30 64Z" fill="#f6f3ea" stroke="#c9c3b2" stroke-width="1.6"/>
     <path d="M17 6 C 16 26 16 44 17 62" stroke="#d6d0c0" stroke-width="1.4" fill="none"/></svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 24 48"><path d="M2 48 Q 4 20 1 2 Q 9 18 9 48Z" fill="#5aa23a"/><path d="M8 48 Q 11 14 13 0 Q 17 20 16 48Z" fill="#78c04a"/><path d="M15 48 Q 18 26 23 8 Q 23 30 22 48Z" fill="#4c9234"/></svg>`,
    { size: 96 },
  );
  const BLUEPRINT = svg(
    `<svg viewBox="0 0 80 100"><rect width="80" height="100" rx="3" fill="#2a5aa0"/>
     <rect x="4" y="4" width="72" height="92" fill="none" stroke="#cfe8ff" stroke-width="1.2"/>
     <g stroke="#4f82c4" stroke-width="0.5"><path d="M4 24H76M4 44H76M4 64H76M4 84H76M24 4V96M44 4V96M64 4V96"/></g>
     <circle cx="30" cy="38" r="14" fill="none" stroke="#e6f3ff" stroke-width="1.6" stroke-dasharray="3.2 2.2"/>
     <circle cx="30" cy="38" r="7" fill="none" stroke="#e6f3ff" stroke-width="1.4"/><circle cx="30" cy="38" r="2" fill="#e6f3ff"/>
     <path d="M52 20 L70 20 M61 20 V46 M49 40 L73 40 M49 52 L73 52" stroke="#e6f3ff" stroke-width="1.4"/>
     <path d="M12 66 H68 M12 72 H52 M12 78 H60" stroke="#cfe8ff" stroke-width="1.2"/>
     <text x="10" y="90" font-family="monospace" font-size="7" fill="#e6f3ff">MK-VII CLOCKPACK</text></svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#5a371e" stroke="#f1dcae" stroke-width="3" stroke-dasharray="6 3"/>
     <circle cx="32" cy="32" r="17" fill="none" stroke="#e8c26a" stroke-width="8" stroke-dasharray="4.4 4.4"/>
     <circle cx="32" cy="32" r="15" fill="#e8c26a"/><circle cx="32" cy="32" r="6" fill="#5a371e"/>
     <path d="M32 6 V16 M32 48 V58" stroke="#f1dcae" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const STAR = svg(
    `<svg viewBox="0 0 40 40"><polygon points="20,3 25,15 38,16 28,25 31,38 20,31 9,38 12,25 2,16 15,15" fill="#f3c747" stroke="#8a5a14" stroke-width="2" stroke-linejoin="round"/>
     <polygon points="20,9 23,16 31,17 25,22 27,30 20,26 13,30 15,22 9,17 17,16" fill="none" stroke="#fff0b0" stroke-width="1.2" stroke-dasharray="2 2"/></svg>`,
    { size: 128 },
  );
  const SIGN = svg(
    `<svg viewBox="0 0 110 44"><rect width="110" height="44" rx="4" fill="#c99a5e"/><rect x="2" y="2" width="106" height="40" rx="3" fill="none" stroke="#6b4423" stroke-width="2.5"/>
     <text x="55" y="19" text-anchor="middle" font-family="serif" font-weight="bold" font-size="15" fill="#3a2312">TINKER'S</text>
     <text x="55" y="36" text-anchor="middle" font-family="serif" font-weight="bold" font-size="13" fill="#7a2a1a">REPAIRS</text></svg>`,
    { size: 256 },
  );
  const GAUGE_A = gaugeTexture({ needle: 50, label: "BAR" });
  const GAUGE_B = gaugeTexture({ needle: -20, label: "PSI", red: [90, 135] });

  // ------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.33, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.33, 0],
      [0, 0.46, 0.03],
      [0, 0.58, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.6, 0.01],
      [0, 0.68, 0.02],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 0.68, 0.02], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.705, 0.03], aim: [0, 0.685, 0.13], role: "jaw" });

  // ------------------------------------------------------------------ torso, belt, straps
  const torsoPaint = paint((p, n) => {
    if (p.y < 0.352) return TRIM;
    if (n.z > 0.1) {
      const hw = p.y > 0.44 ? 0.07 + (0.6 - p.y) * 0.18 : 0.155;
      const d = hw - Math.abs(p.x);
      if (d > 0 && d < 0.006 && p.y < 0.6) return STITCH;
      if (p.y > 0.365 && p.y < 0.412 && Math.abs(p.x) < 0.065) {
        const e = Math.min(p.y - 0.365, 0.412 - p.y, 0.065 - Math.abs(p.x));
        return e < 0.004 ? STITCH : LEATHER2;
      }
      if (d >= 0 && p.y < 0.6) return LEATHER;
    }
    return TUNIC;
  });
  const torso = b.sweep(
    spine,
    (t) => pair(0.18 - 0.035 * t, 0.15 + 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.3)) - 0.04 * t),
    { color: torsoPaint, caps: { start: "flat", end: "round" }, sides: 10, smooth: false },
  );
  b.sweep(neck, 0.055, { color: SKIN, sides: 7 });
  const tskin = b.surface(torso);

  const belt = tskin.loop([0, 0.43, 0.02], { lift: 0.004 });
  b.sweep(belt, 0.017, { color: LEATHER2, sides: 6 });
  const buckHit = tskin.ray([0, 0.43, 1], [0, 0, -1]);
  if (buckHit) {
    b.stick(new THREE.BoxGeometry(0.062, 0.014, 0.05), BRASS, buckHit, { embed: 0.1 });
    b.stick(new THREE.BoxGeometry(0.036, 0.018, 0.026), DARK, buckHit, { embed: 0.2 });
  }
  const embHit = tskin.ray([0, 0.389, 1], [0, 0, -1]);
  if (embHit) b.decal(torso, EMBLEM, { at: embHit, size: [0.05, 0.05] });

  // pouch on the left hip, hammer on the right
  const pouchHit = tskin.ray([0.6, 0.4, 0.1], [-1, 0, 0]);
  if (pouchHit) {
    b.stick(new THREE.SphereGeometry(1, 8, 6), LEATHER2, pouchHit, { embed: 0.3, scale: [0.045, 0.026, 0.055] });
    b.stick(new THREE.SphereGeometry(0.009, 6, 4), BRASS, pouchHit, { embed: -0.9 });
  }
  const hamHit = tskin.ray([-0.6, 0.42, 0.06], [1, 0, 0]);
  if (hamHit) {
    const hp = hamHit.at.clone();
    b.rod(hp.clone().add(V3(-0.02, 0.02, 0)), hp.clone().add(V3(-0.03, -0.13, 0.01)), 0.009, WOOD, {
      bone: spine2,
      sides: 6,
    });
    b.part(new THREE.BoxGeometry(0.036, 0.03, 0.085), IRON, {
      bone: spine2,
      at: hp.clone().add(V3(-0.03, -0.135, 0.01)),
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { bone: spine2, at: hp.clone().add(V3(-0.02, 0.02, 0)) });
  }

  for (const s of [1, -1]) {
    const pts: V[] = [
      [s * 0.08, 0.64, -0.14],
      [s * 0.1, 0.68, -0.01],
      [s * 0.095, 0.6, 0.1],
      [s * 0.088, 0.5, 0.19],
      [s * 0.08, 0.42, 0.2],
    ];
    const strap = b.sweep(tskin.drape(catmull(pts), { lift: 0.006 }), 0.014, { color: LEATHER2, sides: 6 });
    b.stick(new THREE.BoxGeometry(0.034, 0.01, 0.032), BRASS, strap.at(0.82), { embed: 0.2 });
  }

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.33, 0], [s * 0.09, 0.07, 0.015], [0.14, 0.14], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, (t) => 0.064 - 0.017 * t, { color: PANTS, sides: 8, smooth: false });
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    b.part(new THREE.SphereGeometry(1, 7, 5), LEATHER2, {
      bone: knee,
      at: [pts[1].x, pts[1].y, pts[1].z + 0.052],
      scale: [0.04, 0.045, 0.014],
    });
    // boot
    const x = s * 0.09;
    b.capsule([x, 0.052, -0.02], [x, 0.052, 0.1], 0.05, BOOT, { bone: ankle, sides: 8, smooth: false });
    b.part(new THREE.CylinderGeometry(0.056, 0.058, 0.07, 9), BOOT, { bone: ankle, at: [x, 0.092, 0.012], flat: true });
    b.part(new THREE.TorusGeometry(0.058, 0.014, 5, 10), "#c7a26a", {
      bone: ankle,
      at: [x, 0.125, 0.012],
      dir: [0, 1, 0],
      axis: "z",
    });
    b.part(new THREE.BoxGeometry(0.108, 0.014, 0.2), DARK, { bone: ankle, at: [x, 0.007, 0.035] });
    const toe = b.joint(`toe${side}`, { parent: ankle, at: [x, 0.04, 0.075], dir: [0, 0, 1], role: "digit" });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), "#6b4529", { bone: toe, at: [x, 0.05, 0.102], scale: [1, 0.85, 0.9] });
    for (const z of [0.05, 0.075]) {
      b.part(new THREE.BoxGeometry(0.05, 0.006, 0.006), STITCH, { bone: ankle, at: [x, 0.106 - (z - 0.05) * 0.2, z], rotation: [20, 0, 0] });
    }
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.026), BRASS, { bone: ankle, at: [x + s * 0.057, 0.1, 0.012] });
  }

  // ------------------------------------------------------------------ arms and hands
  let forearmSweep: ReturnType<typeof b.sweep> | null = null;
  let forearmPts: { E: V; W: V } | null = null;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S: V = [s * 0.17, 0.565, 0];
    const E: V = [s * 0.27, 0.46, 0.03];
    const W: V = [s * 0.31, 0.36, 0.09];
    const arm = b.chain(`arm${side}`, catmull([S, E, W]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const SLEEVE = mottle("#3f78a8", "#386b98", { size: 0.07, seed: 4 });
    const sw = b.sweep(arm, (t) => 0.052 - 0.014 * t, {
      color: SKIN,
      bands: [
        [0.54, SLEEVE],
        [1, SKIN],
      ],
      sides: 8,
      smooth: false,
    });
    if (s > 0) {
      forearmSweep = sw;
      forearmPts = { E, W };
    }
    const wrist = arm.joints[2];
    b.part(new THREE.SphereGeometry(0.06, 8, 6), SLEEVE, { bone: arm.joints[0], at: S, scale: [1, 0.9, 1], flat: true });
    b.part(new THREE.TorusGeometry(0.046, 0.012, 5, 9), STITCH, {
      bone: arm.joints[1],
      at: lerp(E, W, 0.04),
      dir: [s * 0.04, -0.1, 0.06],
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.044, 8, 6), SKIN, { bone: wrist, at: [s * 0.31, 0.335, 0.095], scale: [0.85, 1, 1], flat: true });
    const fingers: [string, V, V, V][] = [
      ["index", [s * 0.31, 0.32, 0.12], [s * 0.313, 0.29, 0.126], [s * 0.313, 0.266, 0.136]],
      ["middle", [s * 0.31, 0.318, 0.095], [s * 0.313, 0.286, 0.1], [s * 0.313, 0.258, 0.11]],
      ["ring", [s * 0.31, 0.32, 0.07], [s * 0.313, 0.29, 0.073], [s * 0.313, 0.266, 0.082]],
      ["thumb", [s * 0.292, 0.345, 0.125], [s * 0.285, 0.322, 0.152], [s * 0.28, 0.304, 0.172]],
    ];
    for (const [nm, a, m, e] of fingers) {
      const f = b.chain(`${nm}${side}`, polyline([a, m, e]), {
        parent: wrist,
        names: [`${nm}${side}1`, `${nm}${side}2`],
        role: "digit",
      });
      b.sweep(f, [0.013, 0.009], { color: SKIN, sides: 5 });
    }
  }
  // wrist gauge bracer on the left forearm
  if (forearmSweep && forearmPts) {
    const { E, W } = forearmPts;
    const M = lerp(E, W, 0.5);
    const fdir = V3(W[0] - E[0], W[1] - E[1], W[2] - E[2]).normalize();
    b.part(new THREE.TorusGeometry(0.043, 0.011, 5, 9), LEATHER2, { at: M, dir: fdir, axis: "z", bone: forearmSweep.bone });
    const gh = b.surface(forearmSweep).nearest([M.x + 0.2, M.y + 0.05, M.z]);
    b.stick(new THREE.CylinderGeometry(0.04, 0.04, 0.016, 10), BRASS, gh, { embed: 0.35 });
    b.part(new THREE.CircleGeometry(0.032, 16), "#ffffff", {
      at: gh.moved([0, 0.0125, 0]),
      dir: gh.axis,
      axis: "z",
      texture: GAUGE_A,
    });
  }

  // ------------------------------------------------------------------ head
  const HEAD_C: V = [0, 0.74, 0.035];
  const skullPaint = paint(() => SKIN);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), skullPaint, {
    bone: head,
    at: HEAD_C,
    scale: [0.108, 0.1, 0.105],
    flat: true,
  });
  const hskin = b.surface(skull);
  for (const s of [1, -1]) {
    const eh = hskin.around(HEAD_C).at(s * 28, 6);
    if (eh) b.decal(skull, EYE, { at: eh, size: [0.042, 0.05], mirror: s > 0 });
    // bushy brows
    b.sweep(
      bezier([s * 0.008, 0.788, 0.136], [s * 0.05, 0.806, 0.13], [s * 0.098, 0.784, 0.098]),
      [0.022, 0.009],
      { color: BEARD, bone: head, sides: 6, caps: { start: "round", end: "point" } },
    );
    // mustache
    b.sweep(bezier([s * 0.01, 0.704, 0.136], [s * 0.065, 0.682, 0.13], [s * 0.1, 0.7, 0.09]), [0.03, 0.008], {
      color: BEARD,
      bone: head,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
    // ears
    b.extrude(
      [
        [0, -0.035],
        [0.05, -0.03],
        [0.115, 0.045],
        [0.03, 0.04],
      ],
      { at: [s * 0.098, 0.735, 0.03], x: [s, 0, -0.3], y: [0, 1, 0], thickness: 0.012, smoothing: 1, color: SKIN, bone: head },
    );
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), "#f08a7c", { bone: head, at: [0, 0.728, 0.145], scale: [0.047, 0.042, 0.046], flat: true });
  b.part(new THREE.SphereGeometry(1, 5, 4), "#ffd6c8", { bone: head, at: [0.008, 0.742, 0.178], scale: [0.012, 0.008, 0.008] });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 7, 5), "#f08f86", {
      bone: head,
      at: [s * 0.072, 0.712, 0.106],
      scale: [0.024, 0.017, 0.011],
      dir: [s * 0.5, 0, 1],
      axis: "z",
      flat: true,
    });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#5a1f1f", { bone: head, at: [0, 0.69, 0.128], scale: [0.032, 0.011, 0.012] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.012, 0.014, 0.006), "#ffffff", { bone: head, at: [s * 0.007, 0.683, 0.133] });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: jaw, at: [0, 0.672, 0.08], scale: [0.07, 0.032, 0.06], flat: true });

  // beard
  const beard = b.chain(
    "beard",
    catmull([
      [0, 0.658, 0.09],
      [0, 0.6, 0.15],
      [0, 0.53, 0.19],
      [0, 0.45, 0.235],
    ]),
    { parent: jaw, names: ["beard1", "beard2", "beard3"] },
  );
  const beardSw = b.sweep(
    beard,
    (t) => pair(0.085 * Math.pow(1 - t, 0.55) + 0.006, 0.05 * Math.pow(1 - t, 0.45) + 0.006),
    { color: BEARD, caps: { start: "round", end: "point" }, sides: 9, smooth: false },
  );
  const bHits = b.surface(beardSw).scatter(70, { rng: rng(5), minDist: 0.028, filter: (h) => h.n.y < 0.6 });
  b.cards(bHits, TUFT, { size: [0.038, 0.07], lean: 60, bend: 20, vary: 0.3, rng: rng(6), flow: [0, -1, 0.25] });
  const clasp = beard.at(0.62);
  b.part(new THREE.TorusGeometry(0.046, 0.009, 5, 10), GILT, {
    bone: jaw,
    at: clasp.at,
    dir: clasp.tangent,
    axis: "z",
    scale: [1.1, 0.7, 1],
  });

  // ------------------------------------------------------------------ hat
  const hat = b.chain(
    "hat",
    catmull([
      [0, 0.8, 0.02],
      [0, 0.93, 0.01],
      [0, 1.06, -0.04],
      [0.03, 1.14, -0.16],
    ]),
    { parent: head, names: ["hat1", "hat2", "hat3"] },
  );
  const hatTube = b.sweep(hat, (t) => 0.13 * Math.pow(1 - t, 1.1) + 0.005, {
    color: HAT_P,
    caps: { start: "flat", end: "point" },
    sides: 10,
    smooth: false,
  });
  b.lathe(
    [
      [0, 0],
      [0.2, -0.012],
      [0.215, -0.004],
      [0.2, 0.01],
      [0.12, 0.025],
      [0, 0.025],
    ],
    { at: [0, 0.795, 0.02], bone: head, segments: 14, color: HAT_P },
  );
  b.part(new THREE.TorusGeometry(0.121, 0.014, 5, 12), "#3a2618", { bone: head, at: [0, 0.815, 0.02], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.BoxGeometry(0.044, 0.046, 0.01), BRASS, { bone: head, at: [0, 0.815, 0.152] });
  b.part(new THREE.BoxGeometry(0.026, 0.026, 0.012), DARK, { bone: head, at: [0, 0.815, 0.153] });
  const tip = hat.at(1);
  b.part(new THREE.SphereGeometry(0.024, 8, 6), GILT, { bone: hat.joints[2], at: offset(tip.at, tip.tangent, 0.012), flat: true });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.004), DARK, { bone: hat.joints[2], at: offset(tip.at, tip.tangent, 0.004) });

  // goggles pushed up on the hat
  const hatSkin = b.surface(hatTube);
  for (const s of [1, -1]) {
    const gh = hatSkin.around([0, 0.9, 0.02]).at(s * 30, 0);
    if (gh) {
      b.stick(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 10), BRASS, gh, { embed: 0.35, bone: head });
      glow(b.stick(new THREE.CylinderGeometry(0.034, 0.034, 0.04, 10), "#8fe3ff", gh, { embed: 0.4, bone: head }), 1.3);
      b.stick(new THREE.SphereGeometry(0.008, 5, 4), "#ffffff", gh.moved([s * 0.01, 0.025, 0.012]), { embed: 0.2, bone: head });
    }
  }
  b.part(new THREE.TorusGeometry(0.094, 0.008, 4, 12), LEATHER2, { bone: head, at: [0, 0.9, 0.012], dir: [0, 1, 0], axis: "z" });
  const sh = hatSkin.around([0, 1.0, -0.01]).at(-35, 0);
  if (sh) b.decal(hatTube, STAR, { at: sh, size: [0.07, 0.07] });

  // ------------------------------------------------------------------ backpack
  const PC: V = [0, 0.5, -0.22];
  const pack = b.joint("pack", { parent: chest, at: PC, dir: [0, 1, 0], group: "pack" });
  b.part(new THREE.BoxGeometry(0.32, 0.34, 0.15), PACK, { bone: pack, at: PC });
  b.part(new THREE.BoxGeometry(0.335, 0.05, 0.17), FLAP, { bone: pack, at: [0, 0.69, -0.22] });
  b.part(new THREE.BoxGeometry(0.05, 0.17, 0.11), FLAP, { bone: pack, at: [-0.185, 0.4, -0.22] });
  const pipe = (a: V, c: V) => b.rod(a, c, 0.009, LEATHER2, { bone: pack, sides: 6 });
  for (const sx of [1, -1])
    for (const z of [-0.145, -0.295]) {
      pipe([sx * 0.16, 0.33, z], [sx * 0.16, 0.67, z]);
      for (const y of [0.33, 0.67]) pipe([sx * 0.16, y, z], [-sx * 0.16, y, z]);
    }
  for (const sx of [1, -1]) for (const y of [0.33, 0.67]) pipe([sx * 0.16, y, -0.145], [sx * 0.16, y, -0.295]);
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.022, 0.05, 0.012), BRASS, { bone: pack, at: [sx * 0.07, 0.68, -0.305] });
  }

  // gear train on the back
  const train = gearTrain(b, {
    at: [0, 0.44, -0.298],
    axis: [0, 0, -1],
    module: 0.0055,
    spin: "gear",
    bone: pack,
    group: "pack",
    gears: [
      { teeth: 24, spokes: 5, bore: 0.004 },
      { teeth: 12, angle: 55 },
      { teeth: 16, from: 0, angle: -125, holes: 4, color: GILT },
      { teeth: 20, on: 1, shift: 0.014, spokes: 5, texture: true, color: TINT.gilt },
    ],
  });
  train.spin(18);

  // gauge on the back
  b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.012, 10), GILT, { bone: pack, at: [0, 0.615, -0.299], dir: [0, 0, -1] });
  b.part(new THREE.CircleGeometry(0.036, 18), "#ffffff", {
    bone: pack,
    at: [0, 0.615, -0.3055],
    dir: [0, 0, -1],
    axis: "z",
    texture: GAUGE_B,
  });

  // copper tank on the lid
  const TC: V = [0, 0.76, -0.22];
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.26, 10), TANK, { bone: pack, at: TC, dir: [1, 0, 0] });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 10, 6), COPPER, { bone: pack, at: [sx * 0.13, TC[1], TC[2]], flat: true });
    b.part(new THREE.TorusGeometry(0.052, 0.008, 4, 10), BRASS, { bone: pack, at: [sx * 0.085, TC[1], TC[2]], dir: [1, 0, 0], axis: "z" });
  }
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.03, 8), BRASS, { bone: pack, at: [0.09, 0.805, -0.22] });

  // rotor on a spring
  const rotor = b.joint("rotor", { parent: pack, at: [0, 0.85, -0.22], dir: [0, 1, 0], role: "fan" });
  b.sweep(coil([0, 0.81, -0.22], [0, 0.85, -0.22], 0.016, 4), 0.0035, { color: STEEL, bone: pack, sides: 5 });
  b.rod([0, 0.85, -0.22], [0, 0.89, -0.22], 0.006, STEEL, { bone: rotor });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), GILT, { bone: rotor, at: [0, 0.89, -0.22] });
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3 + 0.3;
    b.extrude(
      [
        [0.015, -0.012],
        [0.06, -0.022],
        [0.115, -0.014],
        [0.125, 0],
        [0.115, 0.014],
        [0.06, 0.022],
        [0.015, 0.012],
      ],
      {
        at: [0, 0.89, -0.22],
        x: [Math.cos(a), 0, Math.sin(a)],
        y: [-Math.sin(a), 0, Math.cos(a)],
        thickness: 0.005,
        color: k === 1 ? "#f3c747" : "#d9503a",
        bone: rotor,
      },
    );
  }

  // telescope on the left side
  const tdir = V3(0.38, 0.9, -0.12).normalize();
  const t0 = V3(0.2, 0.34, -0.22);
  const t1 = t0.clone().addScaledVector(tdir, 0.2);
  const t2 = t1.clone().addScaledVector(tdir, 0.1);
  const t3 = t2.clone().addScaledVector(tdir, 0.09);
  b.rod(t0, t1, 0.03, LEATHER, { bone: pack, sides: 8 });
  b.rod(t1, t2, 0.023, BRASS, { bone: pack, sides: 8 });
  b.rod(t2, t3, 0.018, GILT, { bone: pack, sides: 8 });
  for (const p of [t1, t2]) b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), STEEL, { bone: pack, at: p, dir: tdir, axis: "z" });
  glow(
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.006, 8), "#9fe8ff", {
      bone: pack,
      at: t3.clone().addScaledVector(tdir, 0.003),
      dir: tdir,
    }),
    1.2,
  );
  for (const k of [0.04, 0.15])
    b.part(new THREE.TorusGeometry(0.032, 0.006, 4, 8), LEATHER2, { bone: pack, at: lerp(t0, t1, k / 0.2), dir: tdir, axis: "z" });

  // horn on the right, fed by a copper pipe
  const hdir = V3(-0.55, 0.8, 0.05).normalize();
  b.lathe(
    [
      [0.012, 0],
      [0.014, 0.1],
      [0.028, 0.16],
      [0.06, 0.2],
      [0.07, 0.215],
      [0.064, 0.215],
      [0.045, 0.19],
      [0.022, 0.15],
      [0.008, 0.1],
      [0.006, 0],
    ],
    { at: [-0.185, 0.47, -0.22], axis: hdir, segments: 10, color: GILT, bone: pack },
  );
  b.sweep(
    catmull([
      [-0.13, 0.76, -0.22],
      [-0.2, 0.74, -0.22],
      [-0.215, 0.6, -0.22],
      [-0.185, 0.48, -0.22],
    ]),
    0.01,
    { color: COPPER, bone: pack, sides: 6 },
  );

  // lantern hanging from the right
  b.rod([-0.16, 0.365, -0.22], [-0.23, 0.365, -0.22], 0.006, IRON, { bone: pack });
  const lantern = b.joint("lantern", { parent: pack, at: [-0.23, 0.365, -0.22], dir: [0, 1, 0] });
  b.rod([-0.23, 0.365, -0.22], [-0.23, 0.305, -0.22], 0.004, IRON, { bone: lantern });
  b.part(new THREE.ConeGeometry(0.048, 0.036, 6), BRASS, { bone: lantern, at: [-0.23, 0.29, -0.22] });
  glow(b.part(new THREE.CylinderGeometry(0.038, 0.034, 0.08, 6), "#ffcf5a", { bone: lantern, at: [-0.23, 0.232, -0.22], flat: true }), 1.3);
  glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), "#fff6c0", { bone: lantern, at: [-0.23, 0.232, -0.22] }), 2);
  b.part(new THREE.CylinderGeometry(0.042, 0.034, 0.016, 6), IRON, { bone: lantern, at: [-0.23, 0.186, -0.22] });
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    b.rod([-0.23 + Math.cos(a) * 0.039, 0.272, -0.22 + Math.sin(a) * 0.039], [-0.23 + Math.cos(a) * 0.036, 0.194, -0.22 + Math.sin(a) * 0.036], 0.003, IRON, { bone: lantern });
  }

  // tin cup
  b.rod([0.215, 0.345, -0.22], [0.215, 0.29, -0.22], 0.003, IRON, { bone: pack });
  b.part(new THREE.CylinderGeometry(0.032, 0.026, 0.05, 8), STEEL, { bone: pack, at: [0.215, 0.262, -0.22] });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), STEEL, { bone: pack, at: [0.24, 0.262, -0.22], dir: [0, 0, 1], axis: "z" });

  // tools stuck in the rear pocket
  const wa = tilt(-0.35);
  b.extrude(
    [
      [-0.007, 0],
      [0.007, 0],
      [0.008, 0.1],
      [0.022, 0.118],
      [0.024, 0.142],
      [0.009, 0.156],
      [0.009, 0.138],
      [-0.009, 0.138],
      [-0.009, 0.156],
      [-0.024, 0.142],
      [-0.022, 0.118],
      [-0.008, 0.1],
    ],
    { at: [-0.09, 0.68, -0.288], x: wa.x, y: wa.y, thickness: 0.01, color: STEEL, bone: pack },
  );
  const sd = V3(0.3, 0.95, 0).normalize();
  const sb = V3(0.09, 0.68, -0.288);
  b.rod(sb, sb.clone().addScaledVector(sd, 0.08), 0.016, "#e2762c", { bone: pack, sides: 6 });
  b.rod(sb.clone().addScaledVector(sd, 0.08), sb.clone().addScaledVector(sd, 0.17), 0.004, STEEL, { bone: pack, sides: 5 });

  // rolled blueprint hanging below
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.34, 10), "#e9dcb8", { bone: pack, at: [0, 0.31, -0.22], dir: [1, 0, 0] });
  for (const x of [-0.1, 0.1]) b.part(new THREE.TorusGeometry(0.038, 0.007, 4, 10), LEATHER2, { bone: pack, at: [x, 0.31, -0.22], dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.BoxGeometry(0.12, 0.17, 0.004), "#ffffff", {
    bone: pack,
    at: [0.04, 0.19, -0.262],
    texture: BLUEPRINT,
    rotation: [3, 0, 5],
  });

  // ------------------------------------------------------------------ base
  const baseP = paint((p, n) => {
    if (n.y > 0.5) return mottle("#5fa046", "#4d8a3a", { size: 0.08, seed: 21 });
    return mottle("#6b4a2e", "#563a22", { size: 0.05, seed: 22 });
  });
  const base = b.lathe(
    [
      [0, -G],
      [0.6, -G],
      [0.64, -0.03],
      [0.62, 0],
      [0.55, 0.012],
      [0, 0.016],
    ],
    { at: [0, 0, 0], bone: root, segments: 14, color: baseP },
  );
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + R() * 0.1;
    b.part(new THREE.BoxGeometry(0.1 + R() * 0.05, 0.05 + R() * 0.03, 0.07), STONE, {
      bone: root,
      at: [Math.cos(a) * 0.585, 0.005, Math.sin(a) * 0.585],
      rotation: [R() * 8, -deg(a), R() * 8],
    });
  }
  const gs = b.surface(base).scatter(90, {
    rng: rng(31),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.7 && Math.hypot(h.at.x, h.at.z) > 0.18 && Math.hypot(h.at.x, h.at.z) < 0.56,
  });
  b.cards(gs, GRASS, { size: [0.04, 0.07], lean: 15, bend: 15, vary: 0.35, cross: true, rng: rng(32) });

  // stump workbench with half-built gadget
  b.part(new THREE.CylinderGeometry(0.11, 0.13, 0.17, 10), BARK, { bone: root, at: [0.4, 0.085, 0.24], flat: true });
  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.008, 10), "#d8b27a", { bone: root, at: [0.4, 0.172, 0.24] });
  b.part(new THREE.TorusGeometry(0.06, 0.003, 4, 12), "#a97c46", { bone: root, at: [0.4, 0.177, 0.24], dir: [0, 1, 0], axis: "z" });
  b.part(gearGeometry({ teeth: 16, module: 0.005, spokes: 4, bore: 0.004 }), BRASS, { bone: root, at: [0.37, 0.182, 0.25], dir: [0, 1, 0] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.03, 6), STEEL, { bone: root, at: [0.37, 0.19, 0.25] });
  glow(b.part(new THREE.OctahedronGeometry(0.028), "#6df0ff", { bone: root, at: [0.44, 0.21, 0.22], scale: [1, 1.7, 1], flat: true }), 1.6);

  // loose gears
  b.part(gearGeometry({ teeth: 20, module: 0.007, spokes: 5, bore: 0.005 }), metal("brass", { verdigris: 0.3, seed: 8 }), {
    bone: root,
    at: [0.22, 0.012, 0.44],
    dir: [0, 1, 0],
  });
  b.part(gearGeometry({ teeth: 14, module: 0.007, holes: 4, bore: 0.004 }), COPPER, {
    bone: root,
    at: [-0.12, 0.03, 0.46],
    dir: [0.25, 0.95, 0.1],
  });
  b.part(gearGeometry({ teeth: 12, module: 0.006 }), GILT, { bone: root, at: [0.0, 0.01, 0.38], dir: [0, 1, 0] });

  // mushrooms
  const mushroom = (x: number, z: number, sc: number, cap: Fill, glowing: boolean) => {
    b.part(new THREE.CylinderGeometry(0.014 * sc, 0.018 * sc, 0.05 * sc, 7), "#f1e6cc", { bone: root, at: [x, 0.025 * sc, z] });
    const c = b.lathe(
      [
        [0, 0],
        [0.045 * sc, 0.005 * sc],
        [0.05 * sc, 0.02 * sc],
        [0.035 * sc, 0.045 * sc],
        [0, 0.055 * sc],
      ],
      { at: [x, 0.045 * sc, z], bone: root, segments: 9, color: cap },
    );
    if (glowing) glow(c, 1.5);
  };
  const redCap = spots("#d63a2a", "#fff2d8", { size: 0.025, amount: 0.5, seed: 5 });
  mushroom(-0.3, 0.32, 1.4, redCap, false);
  mushroom(-0.37, 0.4, 0.9, redCap, false);
  mushroom(-0.22, 0.42, 0.8, "#59e8d6", true);
  mushroom(-0.46, 0.27, 0.7, "#59e8d6", true);

  // sign post
  b.rod([-0.47, 0, 0.08], [-0.47, 0.36, 0.08], 0.014, WOOD, { bone: root, sides: 6 });
  b.part(new THREE.BoxGeometry(0.24, 0.1, 0.016), WOOD, { bone: root, at: [-0.47, 0.3, 0.095] });
  b.part(new THREE.PlaneGeometry(0.22, 0.09), "#ffffff", {
    bone: root,
    at: [-0.47, 0.3, 0.1042],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN,
  });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), BRASS, { bone: root, at: [-0.47, 0.37, 0.08] });

  // lift everything so the base sits on y = 0
  b.root.position.y = G;
  return b.root;
}
