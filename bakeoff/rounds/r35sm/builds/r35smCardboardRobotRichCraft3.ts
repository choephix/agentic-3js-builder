import * as THREE from "three";
import { createBuilder, polyline, paint, mottle, grain, svg, offset } from "../../../../src/index";
import { metal, coil, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cardboard Box Robot Kid",
  description:
    "A kid in a homemade cardboard-box robot costume: box torso with a marker-drawn control panel, foil shin guards, dryer-hose arms, a hollow box helmet with a face window, toilet-roll ears and a spring antenna.",
};

// ---------- palette ----------
const CARD = mottle(grain("#b98c57", "#a87c46", { size: 0.012, axis: "y" }), "#9a6f3f", { size: 0.09, seed: 3 });
const LCARD = mottle(grain("#d3a86f", "#c59a5c", { size: 0.012, axis: "x" }), "#b88c52", { size: 0.08, seed: 5 });
const INNER = mottle("#8f6837", "#82602f", { size: 0.06, seed: 8 });
const FOIL = metal("steel", { polish: 0.8, tarnish: 0.05, size: 0.03 });
const HOSE = metal("steel", { polish: 0.5, tarnish: 0.15 });
const RING = "#4f5663";
const TAPE = "#9aa0a6";
const MASK = "#eadcb4";
const DARK = "#2a1c10";
const JEANS = mottle("#3f6fb0", "#385f9c", { size: 0.05, seed: 11 });
const CUFF = "#5b86c4";
const SKIN = "#f1c19a";
const SKIN_D = "#d9a07a";
const HAIR = "#6b3f22";
const GLOVE = "#f2c230";
const SHOE = "#d8362c";
const WHITE = "#f4f1ea";

// ---------- textures ----------
const FONT = "font-family='Comic Sans MS, Marker Felt, cursive' font-weight='bold'";

const PANEL = svg(
  `<svg viewBox="0 0 68 52" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="65" height="49" rx="4" fill="#3b3f4a" stroke="#14161c" stroke-width="2.5"/>
  <rect x="6" y="6" width="34" height="20" rx="2" fill="#18382a" stroke="#0c1a12" stroke-width="1.6"/>
  <polyline points="8,20 13,12 18,22 23,10 28,19 33,13 38,18" fill="none" stroke="#6cff9a" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="51" cy="15" r="9" fill="#eadcb4" stroke="#14161c" stroke-width="2"/>
  <path d="M51 15 L56 9" stroke="#c0281f" stroke-width="2" stroke-linecap="round"/>
  <path d="M44 20 l2 -1 M45 10 l2 1 M51 6 l0 2 M57 10 l-2 1" stroke="#14161c" stroke-width="1.2"/>
  <circle cx="11" cy="33" r="3.6" fill="#e0382c" stroke="#14161c" stroke-width="1.4"/>
  <circle cx="21" cy="33" r="3.6" fill="#f2c230" stroke="#14161c" stroke-width="1.4"/>
  <circle cx="31" cy="33" r="3.6" fill="#44c66a" stroke="#14161c" stroke-width="1.4"/>
  <circle cx="58" cy="35" r="5" fill="#8a909c" stroke="#14161c" stroke-width="1.6"/>
  <path d="M58 31 L58 35" stroke="#14161c" stroke-width="1.6" stroke-linecap="round"/>
  <g stroke="#14161c" stroke-width="1.5" stroke-linecap="round"><path d="M38 30 H48"/><path d="M38 34 H48"/><path d="M38 38 H48"/></g>
  <text x="7" y="46.5" font-size="7.5" ${FONT} fill="#f4e7c0">ROBO-9000</text>
  </svg>`,
  { size: 384 },
);

const TAGTEX = svg(
  `<svg viewBox="0 0 60 34" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="58" height="32" rx="4" fill="#f7f5ee" stroke="#222" stroke-width="1.6"/>
  <rect x="1" y="1" width="58" height="11" rx="4" fill="#d8362c"/>
  <rect x="1" y="8" width="58" height="4" fill="#d8362c"/>
  <text x="30" y="9.5" text-anchor="middle" font-size="7" ${FONT} fill="#fff">HELLO I AM</text>
  <text x="30" y="24" text-anchor="middle" font-size="9.5" ${FONT} fill="#1a3a8a">BEEP-BOY</text>
  <path d="M46 28 q3 -4 6 0 q-3 4 -6 0Z" fill="#d8362c"/>
  </svg>`,
  { size: 256 },
);

const BOLT = svg(
  `<svg viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M30 3 L8 38 L22 38 L16 67 L43 28 L28 28 Z" fill="#ffd21f" stroke="#2a1c10" stroke-width="4" stroke-linejoin="round"/>
  <path d="M28 10 L16 33" stroke="#fff3a0" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const BACK = svg(
  `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M40 4 L52 18 L45 18 L45 34 L35 34 L35 18 L28 18 Z" fill="none" stroke="#2a1c10" stroke-width="3" stroke-linejoin="round"/>
  <text x="40" y="45" text-anchor="middle" font-size="9" ${FONT} fill="#2a1c10">THIS SIDE UP</text>
  <g stroke="#b0281f" stroke-width="2.5" fill="none"><rect x="5" y="49" width="28" height="9" rx="1.5"/></g>
  <text x="19" y="56.5" text-anchor="middle" font-size="6.5" ${FONT} fill="#b0281f">FRAGILE</text>
  <path d="M50 52 q4 -6 8 0 t8 0 t8 0" fill="none" stroke="#2a1c10" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 384 },
);

const FACE = svg(
  `<svg viewBox="0 0 100 76" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="22" cy="48" rx="9" ry="6" fill="#ff8f86" opacity="0.8"/>
  <ellipse cx="78" cy="48" rx="9" ry="6" fill="#ff8f86" opacity="0.8"/>
  <path d="M16 15 Q27 7 38 14" stroke="#5a3318" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M62 14 Q73 7 84 15" stroke="#5a3318" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <ellipse cx="28" cy="31" rx="9" ry="11.5" fill="#2a1608"/>
  <ellipse cx="72" cy="31" rx="9" ry="11.5" fill="#2a1608"/>
  <ellipse cx="28" cy="33" rx="6" ry="8.5" fill="#6a3d1c"/>
  <ellipse cx="72" cy="33" rx="6" ry="8.5" fill="#6a3d1c"/>
  <circle cx="25" cy="27" r="3.6" fill="#fff"/><circle cx="69" cy="27" r="3.6" fill="#fff"/>
  <circle cx="31" cy="37" r="1.7" fill="#fff"/><circle cx="75" cy="37" r="1.7" fill="#fff"/>
  <path d="M34 55 Q50 72 66 55 Q50 59 34 55Z" fill="#8a1f22" stroke="#4a1012" stroke-width="2" stroke-linejoin="round"/>
  <path d="M42 61 Q50 68 58 61 Q50 63 42 61Z" fill="#f08a8a"/>
  <path d="M37 55.5 H63" stroke="#fff" stroke-width="3" opacity="0.9"/>
  <g fill="#c9835c"><circle cx="38" cy="45" r="1"/><circle cx="43" cy="47" r="1"/><circle cx="57" cy="47" r="1"/><circle cx="62" cy="45" r="1"/></g>
  </svg>`,
  { size: 512 },
);

const HAZ = svg(
  `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="8" fill="#f2c230"/>
  <g fill="#1d1d1f"><path d="M0 8 L8 0 L14 0 L6 8Z"/><path d="M12 8 L20 0 L26 0 L18 8Z"/><path d="M24 8 L32 0 L38 0 L30 8Z"/><path d="M36 8 L44 0 L50 0 L42 8Z"/><path d="M48 8 L56 0 L62 0 L54 8Z"/><path d="M60 8 L68 0 L70 0 L62 8Z"/></g>
  </svg>`,
  { size: 512 },
);

const GAUGE = gaugeTexture({ needle: 40, label: "FUN", red: [70, 135] });

// ---------- build ----------
export default function build() {
  const b = createBuilder({ name: "cardboard_robot_kid" });

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.5, 0] });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.5, 0],
      [0, 0.7, 0],
      [0, 0.9, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];
  const neck = b.joint("neck", { parent: chest, at: [0, 0.92, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.97, 0], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.99, 0.03], aim: [0, 0.96, 0.12], role: "jaw" });

  // helpers
  const box = (bone: any, w: number, h: number, d: number, at: number[], color: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (bone: any, r: number, h: number, at: number[], color: any, dir: number[], seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir, ...o });
  const decal = (bone: any, tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });
  const ringGeo = (r: number, t: number) => new THREE.TorusGeometry(r, t, 4, 10).rotateX(Math.PI / 2);

  // ---------- torso box ----------
  box(chest, 0.5, 0.46, 0.36, [0, 0.72, 0], CARD);
  // top flaps (folded closed, slightly lifted)
  for (const s of [1, -1]) {
    box(chest, 0.012, 0.012, 0.3, [s * 0.215, 0.958, 0], LCARD, { rotation: [0, 0, s * 18] });
  }
  box(chest, 0.5, 0.012, 0.06, [0, 0.957, 0.2], LCARD, { rotation: [-20, 0, 0] });
  // tape seams
  box(chest, 0.052, 0.462, 0.364, [-0.17, 0.72, 0], MASK);
  box(chest, 0.505, 0.03, 0.364, [0, 0.93, 0], TAPE);
  // hazard band
  b.part(new THREE.BoxGeometry(0.512, 0.04, 0.372), "#ffffff", { bone: chest, at: [0, 0.525, 0], texture: HAZ });
  // front panel and decor
  box(chest, 0.352, 0.272, 0.006, [0, 0.76, 0.181], MASK);
  decal(chest, PANEL, 0.34, 0.26, [0, 0.76, 0.185], [0, 0, 1]);
  decal(chest, TAGTEX, 0.12, 0.068, [-0.14, 0.607, 0.1825], [0, 0, 1]);
  cyl(chest, 0.054, 0.012, [0.13, 0.607, 0.186], FOIL, [0, 0, 1], 14);
  b.part(new THREE.CircleGeometry(0.047, 20), "#ffffff", {
    bone: chest,
    at: [0.13, 0.607, 0.1935],
    dir: [0, 0, 1],
    axis: "z",
    texture: GAUGE,
  });
  // bottle-cap buttons
  const capCols = ["#e0382c", "#f2c230", "#3f9a5a"];
  [-0.12, 0, 0.12].forEach((x, i) => {
    cyl(chest, 0.021, 0.008, [x, 0.918, 0.184], "#c9ced6", [0, 0, 1], 12);
    glow(cyl(chest, 0.016, 0.01, [x, 0.918, 0.188], capCols[i], [0, 0, 1], 10), 1.1);
  });
  // sides: arm holes, bolts, vents
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.062, 14), DARK, { bone: chest, at: [s * 0.2515, 0.83, 0], dir: [s, 0, 0], axis: "z" });
    decal(chest, BOLT, 0.1, 0.14, [s * 0.2515, 0.64, 0.02], [s, 0, 0]);
    for (let i = 0; i < 3; i++) box(chest, 0.004, 0.012, 0.12, [s * 0.2515, 0.555 + i * 0.0 + 0.0, -0.0], DARK, { visible: false });
  }
  // back
  box(chest, 0.352, 0.25, 0.006, [0, 0.72, -0.181], MASK);
  decal(chest, BACK, 0.34, 0.255, [0, 0.72, -0.185], [0, 0, -1]);
  // shoulder straps (ribbon)
  for (const s of [1, -1]) {
    box(chest, 0.04, 0.012, 0.386, [s * 0.1, 0.955, 0], "#c0281f");
  }

  // ---------- hips / pants ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), JEANS, { bone: hips, at: [0, 0.5, 0], scale: [0.17, 0.09, 0.12] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.1, 0.5, 0],
      [s * 0.105, 0.285, 0.015],
      [s * 0.11, 0.075, 0],
    ];
    const leg = b.chain(`leg${side}`, polyline(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.11, 0, 0.03],
    });
    const knee = leg.joints[1];
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.sweep(leg, [0.06, 0.043], { color: JEANS });
    cyl(ankle, 0.05, 0.03, [s * 0.11, 0.095, 0], CUFF, [0, 1, 0], 10);
    // foil shin guard and cardboard knee box
    box(knee, 0.112, 0.19, 0.12, [s * 0.108, 0.185, 0.012], FOIL);
    box(knee, 0.116, 0.02, 0.124, [s * 0.108, 0.1, 0.012], TAPE);
    box(knee, 0.116, 0.02, 0.124, [s * 0.108, 0.27, 0.012], TAPE);
    box(knee, 0.1, 0.07, 0.11, [s * 0.106, 0.32, 0.018], CARD);
    // sneaker
    box(ankle, 0.1, 0.03, 0.21, [s * 0.11, 0.0145, 0.04], WHITE);
    box(ankle, 0.088, 0.045, 0.14, [s * 0.11, 0.0525, 0.015], SHOE);
    b.part(new THREE.SphereGeometry(1, 8, 6), SHOE, { bone: ankle, at: [s * 0.11, 0.042, 0.1], scale: [0.044, 0.032, 0.05] });
    b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, { bone: ankle, at: [s * 0.11, 0.036, 0.125], scale: [0.04, 0.026, 0.03] });
    for (let i = 0; i < 3; i++) box(ankle, 0.07, 0.006, 0.012, [s * 0.11, 0.077, 0.0 + i * 0.026 + 0.0], WHITE);
  }

  // ---------- arms (dryer hose) ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const p0 = [s * 0.2, 0.83, 0];
    const p1 = [s * 0.4, 0.68, 0.02];
    const p2 = [s * 0.5, 0.5, 0.06];
    const arm = b.chain(`arm${side}`, polyline([p0, p1, p2]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wrist = arm.tip ?? arm.joints[arm.joints.length - 1];
    b.sweep(arm, 0.046, { color: HOSE });
    b.along(arm, 14, (at) => b.part(ringGeo(0.047, 0.006), RING, { frame: at }));
    const d = new THREE.Vector3(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]).normalize();
    const D = [d.x, d.y, d.z];
    // tape cuff at wrist
    cyl(wrist, 0.052, 0.028, [p2[0] + d.x * 0.005, p2[1] + d.y * 0.005, p2[2] + d.z * 0.005], TAPE, D, 10);
    // glove: palm, splayed fingers, thumb
    const pc = new THREE.Vector3(p2[0], p2[1], p2[2]).addScaledVector(d, 0.06);
    cyl(wrist, 0.032, 0.05, [pc.x - d.x * 0.04, pc.y - d.y * 0.04, pc.z - d.z * 0.04], GLOVE, D, 8);
    b.part(new THREE.SphereGeometry(1, 8, 6), GLOVE, { bone: wrist, at: [pc.x, pc.y, pc.z], scale: [0.04, 0.05, 0.03] });
    const zv = new THREE.Vector3(0, 0, 1);
    [-1.5, -0.5, 0.5, 1.5].forEach((k) => {
      const base = pc.clone().addScaledVector(d, 0.04).addScaledVector(zv, k * 0.016);
      const tip = base.clone().addScaledVector(d, 0.05).addScaledVector(zv, k * 0.012);
      b.capsule([base.x, base.y, base.z], [tip.x, tip.y, tip.z], 0.0105, GLOVE, { bone: wrist });
    });
    const tb = pc.clone().addScaledVector(d, 0.0).addScaledVector(zv, 0.03).add(new THREE.Vector3(-s * 0.02, 0, 0));
    const tt = tb.clone().addScaledVector(d, 0.025).addScaledVector(zv, 0.035);
    b.capsule([tb.x, tb.y, tb.z], [tt.x, tt.y, tt.z], 0.0115, GLOVE, { bone: wrist });
  }

  // ---------- kid head ----------
  const HC = [0, 1.05, 0.02];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), SKIN, { bone: head, at: HC, scale: [0.1, 0.105, 0.1] });
  b.decal(skull, FACE, { at: [0, 1.045, 0.118], dir: [0, 0, 1], size: [0.155, 0.118] });
  b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_D, { bone: head, at: [0, 1.03, 0.12], scale: [0.012, 0.011, 0.012] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: head, at: [s * 0.1, 1.05, 0.02], scale: [0.016, 0.026, 0.02] });
  // jaw (lower, separate)
  b.part(new THREE.SphereGeometry(1, 10, 6), SKIN, { bone: jaw, at: [0, 0.964, 0.05], scale: [0.066, 0.026, 0.066] });
  // hair cap, fringe and cowlick
  b.part(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, 1.22), HAIR, { bone: head, at: [0, 1.052, 0.02], scale: [0.107, 0.111, 0.107] });
  [-0.065, -0.033, 0, 0.033, 0.065].forEach((x, i) => {
    const zf = 0.02 + 0.106 * Math.sqrt(Math.max(0.3, 0.9 - (x / 0.106) ** 2)) + 0.002;
    b.extrude(
      [
        [-0.02, 0],
        [0.02, 0],
        [i % 2 ? -0.004 : 0.006, -0.045],
      ],
      { at: [x, 1.1, zf], x: [1, 0, 0], thickness: 0.01, color: HAIR, bone: head },
    );
  });
  b.spike([0.01, 1.155, 0.03], [0.04, 1, 0.1], 0.05, 0.016, { color: HAIR, bone: head });

  // ---------- box helmet (hollow, with face window) ----------
  box(head, 0.34, 0.34, 0.012, [0, 1.07, -0.164], CARD);
  for (const s of [1, -1]) box(head, 0.012, 0.34, 0.34, [s * 0.164, 1.07, 0], CARD);
  box(head, 0.34, 0.012, 0.34, [0, 1.234, 0], LCARD);
  box(head, 0.328, 0.01, 0.318, [0, 1.226, 0], INNER);
  // front frame around the window
  for (const s of [1, -1]) box(head, 0.06, 0.34, 0.02, [s * 0.14, 1.07, 0.16], CARD);
  box(head, 0.22, 0.08, 0.02, [0, 1.2, 0.16], CARD);
  box(head, 0.22, 0.06, 0.02, [0, 0.93, 0.16], CARD);
  // tape around window
  for (const s of [1, -1]) box(head, 0.014, 0.2, 0.004, [s * 0.113, 1.06, 0.172], TAPE);
  box(head, 0.24, 0.014, 0.004, [0, 1.167, 0.172], TAPE);
  box(head, 0.24, 0.014, 0.004, [0, 0.963, 0.172], TAPE);
  // helmet tape on corners
  for (const s of [1, -1]) box(head, 0.03, 0.03, 0.344, [s * 0.164, 1.234, 0], TAPE);
  // lid flaps stuck up like ears
  for (const s of [1, -1]) {
    const a = 35 * (Math.PI / 180);
    box(head, 0.14, 0.01, 0.28, [s * (0.17 + 0.07 * Math.cos(a)), 1.24 + 0.07 * Math.sin(a), 0], LCARD, { rotation: [0, 0, s * 35] });
  }
  // toilet-roll ears
  for (const s of [1, -1]) {
    cyl(head, 0.048, 0.09, [s * 0.208, 1.07, 0], LCARD, [s, 0, 0], 12);
    b.part(new THREE.CircleGeometry(0.036, 12), DARK, { bone: head, at: [s * 0.2535, 1.07, 0], dir: [s, 0, 0], axis: "z" });
    cyl(head, 0.05, 0.012, [s * 0.178, 1.07, 0], TAPE, [s, 0, 0], 12);
    glow(cyl(head, 0.014, 0.01, [s * 0.172, 1.16, 0.0], s > 0 ? "#44e07a" : "#ff4b3a", [s, 0, 0], 8), 1.3);
  }
  // antenna
  cyl(head, 0.026, 0.014, [0, 1.247, 0.0], "#c9ced6", [0, 1, 0], 12);
  b.sweep(coil([0, 1.254, 0], [0, 1.36, 0], 0.02, 6), 0.0045, { color: FOIL, bone: head });
  glow(b.part(new THREE.SphereGeometry(0.03, 8, 6), "#ff3a2a", { bone: head, at: [0, 1.395, 0] }), 1.6);
  // brow stamp: little bolts on helmet front corners
  for (const s of [1, -1]) cyl(head, 0.014, 0.01, [s * 0.14, 1.215, 0.175], "#c9ced6", [0, 0, 1], 10);
  // mouth-speaker slits drawn under window
  for (let i = -2; i <= 2; i++) box(head, 0.008, 0.032, 0.004, [i * 0.03, 0.93, 0.171], DARK);

  return b.root;
}
