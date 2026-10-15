import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, paint, mottle, stripes, grain, mix, smoothstep, noise, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description: "A whimsical low-poly oasis diorama: palms around a turquoise pond, striped tents, camels and a campfire on a sandstone base.",
};

const G = 0.12; // ground height of the sand surface
const SAND = "#f0cf8e", SAND2 = "#e3b86c", TAN = "#c99a5a", TAN_D = "#8f5f30";
const GREEN = "#3f9a4a", GREEN_L = "#7ccf5a", BARK = "#8a5a35", ROCK = "#a98a6a", WATER = "#2fc4c0";
const RED = "#d8553a", CREAM = "#fff1cf", BLUE = "#2f5fa8", GOLD = "#f2b53a", DARK = "#3b2a1f";

const FLAG = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#d8553a"/><rect y="0" width="64" height="5" fill="#f2b53a"/><rect y="35" width="64" height="5" fill="#f2b53a"/><circle cx="30" cy="20" r="11" fill="#fff1cf"/><circle cx="34" cy="18" r="10" fill="#d8553a"/><path d="M45 20 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#fff1cf"/></svg>`, { size: 128 });
const CARPET = svg(`<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#b8332f"/><rect x="3" y="3" width="58" height="42" fill="none" stroke="#f2b53a" stroke-width="3"/><path d="M32 8 L52 24 L32 40 L12 24Z" fill="#2f5fa8" stroke="#fff1cf" stroke-width="2"/><path d="M32 16 L42 24 L32 32 L22 24Z" fill="#f2b53a"/><g fill="#fff1cf"><circle cx="8" cy="8" r="2"/><circle cx="56" cy="8" r="2"/><circle cx="8" cy="40" r="2"/><circle cx="56" cy="40" r="2"/></g></svg>`, { size: 192 });
const BLANKET = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2f5fa8"/><path d="M0 16 L16 0 L32 16 L16 32Z" fill="#d8553a"/><path d="M6 16 L16 6 L26 16 L16 26Z" fill="#f2b53a"/><circle cx="16" cy="16" r="3" fill="#fff1cf"/><rect width="32" height="3" fill="#fff1cf"/><rect y="29" width="32" height="3" fill="#fff1cf"/></svg>`, { size: 64 });
const RIPPLE = svg(`<svg viewBox="0 0 64 64"><g fill="none" stroke="#e8ffff" stroke-width="2.4" stroke-linecap="round"><path d="M10 22 q6 -4 12 0"/><path d="M38 14 q7 -4 14 0"/><path d="M18 44 q8 -4 16 0"/><path d="M42 40 q6 -3 12 0"/><path d="M26 30 q4 -2 8 0"/></g></svg>`, { size: 128 });
const DOOR = svg(`<svg viewBox="0 0 32 40"><path d="M2 40 L10 2 L22 2 L30 40Z" fill="#4a2a2a"/><path d="M2 40 L10 2 L16 2 L16 40Z" fill="#d8553a"/><path d="M30 40 L22 2 L16 2 L16 40Z" fill="#b8332f"/><path d="M16 2 L16 40" stroke="#f2b53a" stroke-width="1.5"/></svg>`, { size: 96 });

const sandTop = mottle(SAND, SAND2, { size: 0.18, seed: 3 });
const strata = paint((p) => (Math.floor(p.y / 0.018 + noise(p, 0.3, 4) * 2) % 2 ? "#c9985a" : "#b4824c"));
const basePaint = paint((_p, n) => (n.y > 0.6 ? sandTop : strata));
const duneP = paint((p, n) => {
  const rip = Math.sin((p.x * 0.9 + p.z * 0.6) / 0.045 + noise(p, 0.2, 1) * 4);
  return mix(mix(SAND, SAND2, 0.5 + 0.5 * rip * smoothstep(0.1, 0.9, n.y)), "#fff0c0", smoothstep(0.7, 1, n.y) * 0.4);
});
const trunkP = stripes(BARK, "#5e3a20", { size: 0.04, axis: "y", width: 0.3, wobble: 0.2 });
const rockP = mottle(ROCK, "#7d6450", { size: 0.06, seed: 9 });

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const sph = (rx: number, ry: number, rz: number, seg = 8) => new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2));
  const put = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { at, bone: root, flat: true, ...o });
  const ball = (at: number[], s: number[], color: any, rot: number[] = [0, 0, 0]) =>
    put(sph(1, 1, 1), color, at, { scale: s, rotation: rot });

  // ---------- base ----------
  b.lathe([[0, 0], [1.08, 0], [1.12, 0.05], [1.1, 0.1], [1.11, 0.115], [1.0, G], [0, G]], {
    at: [0, 0, 0], segments: 24, color: basePaint, bone: root, name: "base",
  });
  // dunes
  const dunes = [[-0.25, -0.82, 0.42, 0.2, 0.2], [0.55, -0.85, 0.3, 0.14, 0.16], [0.88, 0.1, 0.18, 0.12, 0.3], [-0.9, 0.2, 0.17, 0.15, 0.3], [-0.78, -0.5, 0.2, 0.1, 0.18]];
  for (const [x, z, sx, sy, sz] of dunes) ball([x, G - 0.01, z], [sx, sy, sz], duneP);

  // ---------- pond ----------
  const PX = 0, PZ = -0.02;
  put(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 18), "#e6c27a", [PX, G + 0.005, PZ], { scale: [1.3, 1, 0.85] });
  put(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 18), WATER, [PX, G + 0.012, PZ], { scale: [1.3, 1, 0.85] });
  put(new THREE.CircleGeometry(0.3, 16), "#ffffff", [PX, G + 0.0235, PZ], { dir: [0, 1, 0], axis: "z", texture: RIPPLE, scale: [1.3, 0.85, 1], flat: false });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + R() * 0.2;
    const s = 0.03 + R() * 0.025;
    ball([PX + Math.cos(a) * 0.4, G + 0.01, PZ + Math.sin(a) * 0.29], [s * 1.2, s * 0.8, s], rockP, [0, R() * 90, 0]);
  }
  // lily pads + reeds
  for (const [x, z] of [[-0.12, 0.06], [0.14, -0.1], [0.05, 0.08]]) {
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 7), GREEN_L, [PX + x, G + 0.025, PZ + z]);
  }
  put(new THREE.SphereGeometry(0.014, 6, 4), "#ff8fb0", [PX + 0.14, G + 0.033, PZ - 0.1]);
  for (const [x, z] of [[-0.36, 0.2], [-0.4, 0.15], [0.42, -0.2], [0.38, -0.25], [-0.34, -0.2]]) {
    for (let k = 0; k < 3; k++) {
      const bx = PX + x + k * 0.012, bz = PZ + z + (k - 1) * 0.012;
      b.spike([bx, G, bz], [(k - 1) * 0.3, 1, 0.2], 0.12 + 0.03 * k, 0.008, { color: GREEN, sides: 4 });
    }
    put(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 6), "#6b3f22", [PX + x + 0.012, G + 0.13, PZ + z]);
  }

  // ---------- palms ----------
  function palm(x: number, z: number, h: number, lean: number, ang: number, fronds = 9) {
    const dx = Math.cos(ang) * lean, dz = Math.sin(ang) * lean;
    const top = [x + dx, G + h, z + dz];
    const path = catmull([[x, G - 0.01, z], [x + dx * 0.25, G + h * 0.4, z + dz * 0.25], [x + dx * 0.65, G + h * 0.75, z + dz * 0.65], top]);
    b.sweep(path, [0.034, 0.02], { color: trunkP, bone: root, sides: 7, caps: "flat" });
    for (let k = 1; k < 8; k++) {
      const q = path.at(k / 8), r = 0.034 - 0.014 * (k / 8) + 0.006;
      put(new THREE.TorusGeometry(r, 0.005, 4, 8), "#6e4526", q.toArray(), { rotation: [90, 0, 0] });
    }
    for (let i = 0; i < fronds; i++) {
      const a = (i / fronds) * Math.PI * 2 + R() * 0.2;
      const ux = Math.cos(a), uz = Math.sin(a), L = 0.2 + R() * 0.06, up = i % 2 ? 0.1 : 0.16;
      const p0 = top, p1 = [top[0] + ux * L * 0.35, top[1] + up, top[2] + uz * L * 0.35];
      const p2 = [top[0] + ux * L * 0.75, top[1] + up * 0.9, top[2] + uz * L * 0.75];
      const p3 = [top[0] + ux * L, top[1] - 0.08, top[2] + uz * L];
      b.sweep(bezier(p0, p1, p2, p3), (t) => [0.012 + 0.04 * Math.sin(Math.PI * Math.pow(t, 0.7)), 0.005], {
        color: (t: number) => (t < 0.5 ? "#2f7d3c" : t < 0.8 ? GREEN : GREEN_L), section: "box", up: [0, 1, 0], bone: root, caps: "point",
      });
    }
    put(new THREE.SphereGeometry(0.03, 6, 4), "#6e4526", [top[0], top[1] - 0.005, top[2]]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      put(new THREE.SphereGeometry(0.022, 6, 5), "#7a4a22", [top[0] + Math.cos(a) * 0.03, top[1] - 0.03, top[2] + Math.sin(a) * 0.03]);
    }
  }
  palm(-0.48, 0.02, 0.78, 0.14, 0.4);
  palm(0.5, 0.08, 0.64, -0.12, 2.6, 8);
  palm(0.08, -0.4, 0.48, 0.08, -1.4, 7);
  palm(-0.45, -0.12, 0.36, -0.1, 3.4, 6);

  // ---------- tent A (round bedouin) ----------
  const tx = -0.68, tz = -0.44, tyaw = 0.7;
  const canvas = paint((_p, _n, s) => (Math.floor(((s[1] + 360) % 360) / 45) % 2 ? CREAM : RED));
  b.lathe([[0, 0], [0.26, 0], [0.26, 0.11], [0.11, 0.22], [0.025, 0.3], [0, 0.31]], {
    at: [tx, G, tz], segments: 8, color: canvas, bone: root, name: "tentA",
  });
  put(new THREE.TorusGeometry(0.262, 0.01, 4, 16), GOLD, [tx, G + 0.11, tz], { rotation: [90, 0, 0] });
  const fx = Math.sin(tyaw), fz = Math.cos(tyaw);
  b.part(new THREE.PlaneGeometry(0.15, 0.17), "#ffffff", {
    at: [tx + fx * 0.268, G + 0.09, tz + fz * 0.268], dir: [fx, 0, fz], axis: "z", texture: DOOR, bone: root,
  });
  put(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 5), DARK, [tx, G + 0.38, tz]);
  put(new THREE.SphereGeometry(0.016, 6, 4), GOLD, [tx, G + 0.455, tz]);
  put(new THREE.BoxGeometry(0.1, 0.06, 0.004), "#ffffff", [tx + 0.05, G + 0.4, tz], { texture: FLAG, flat: false });
  for (let i = 0; i < 8; i++) { // guy ropes + pegs
    const a = (i / 8) * Math.PI * 2 + 0.39;
    const e = [tx + Math.cos(a) * 0.38, G, tz + Math.sin(a) * 0.38];
    b.rod([tx + Math.cos(a) * 0.17, G + 0.16, tz + Math.sin(a) * 0.17], e, 0.0035, { color: "#d9c79a", bone: root, sides: 4 });
    put(new THREE.CylinderGeometry(0.006, 0.004, 0.03, 4), DARK, [e[0], G + 0.01, e[2]]);
  }

  // ---------- tent B (pavilion) ----------
  const bx = 0.62, bz = -0.5;
  put(new THREE.BoxGeometry(0.46, 0.012, 0.36), "#ffffff", [bx, G + 0.007, bz], { texture: CARPET, flat: false, rotation: [0, 10, 0] });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const px = bx + sx * 0.19 * Math.cos(0.17) + sz * 0.15 * Math.sin(0.17), pz = bz - sx * 0.19 * Math.sin(0.17) + sz * 0.15 * Math.cos(0.17);
    put(new THREE.CylinderGeometry(0.01, 0.012, 0.24, 6), "#7a4a28", [px, G + 0.12, pz]);
    put(new THREE.SphereGeometry(0.015, 5, 4), GOLD, [px, G + 0.245, pz]);
  }
  b.lathe([[0, 0], [0.34, 0], [0.34, 0.025], [0.06, 0.2], [0, 0.23]], {
    at: [bx, G + 0.24, bz], segments: 4, spin: 45 + 10, color: paint((_p, _n, s) => (Math.floor(((s[1] + 360) % 360) / 22.5) % 2 ? BLUE : CREAM)), bone: root, name: "roofB",
  });
  put(new THREE.OctahedronGeometry(0.03), GOLD, [bx, G + 0.5, bz], { scale: [1, 1.4, 1] });
  for (const [x, z, c] of [[-0.1, 0.02, RED], [0.05, -0.06, GOLD], [0.12, 0.06, BLUE]]) {
    ball([bx + x, G + 0.03, bz + z], [0.05, 0.025, 0.045], c, [0, R() * 90, 0]);
  }
  // tea set
  put(new THREE.CylinderGeometry(0.02, 0.028, 0.045, 7), GOLD, [bx - 0.02, G + 0.035, bz + 0.1]);
  put(new THREE.ConeGeometry(0.02, 0.025, 7), GOLD, [bx - 0.02, G + 0.07, bz + 0.1]);

  // ---------- camels ----------
  function camel(cx: number, cz: number, yaw: number, s: number, two: boolean) {
    const c = Math.cos(yaw), sn = Math.sin(yaw);
    const P = (x: number, y: number, z: number) => [cx + (x * c + z * sn) * s, G + y * s, cz + (-x * sn + z * c) * s];
    const rot = [0, (yaw * 180) / Math.PI, 0];
    const cap = (a: number[], d: number[], r0: number, r1: number, col: any) =>
      b.capsule(P(a[0], a[1], a[2]), P(d[0], d[1], d[2]), [r0 * s, r1 * s], { color: col, bone: root, sides: 6 });
    const sp = (x: number, y: number, z: number, sx: number, sy: number, sz: number, col: any) =>
      ball(P(x, y, z), [sx * s, sy * s, sz * s], col, rot);
    cap([0, 0.2, -0.11], [0, 0.2, 0.08], 0.058, 0.055, TAN);
    cap([0, 0.17, -0.08], [0, 0.17, 0.05], 0.05, 0.05, "#e3c28a");
    sp(0, 0.27, -0.075, 0.05, 0.065, 0.055, TAN);
    if (two) sp(0, 0.265, 0.045, 0.05, 0.06, 0.05, TAN);
    for (const sx of [-1, 1]) for (const z of [0.08, -0.11]) {
      cap([sx * 0.04, 0.19, z], [sx * 0.04, 0.1, z + 0.005], 0.024, 0.016, TAN);
      cap([sx * 0.04, 0.1, z + 0.005], [sx * 0.04, 0.025, z], 0.015, 0.012, TAN_D);
      sp(sx * 0.04, 0.012, z + 0.006, 0.016, 0.012, 0.022, DARK);
    }
    cap([0, 0.22, 0.08], [0, 0.34, 0.16], 0.032, 0.022, TAN);
    sp(0, 0.375, 0.2, 0.034, 0.032, 0.05, TAN);
    sp(0, 0.362, 0.252, 0.026, 0.022, 0.03, "#e3c28a");
    sp(0, 0.34, 0.24, 0.02, 0.01, 0.034, TAN_D);
    for (const sx of [-1, 1]) {
      b.part(new THREE.ConeGeometry(0.012, 0.035, 5), TAN_D, { at: P(sx * 0.028, 0.405, 0.185), bone: root, rotation: [0, 0, -sx * 25], flat: true });
      sp(sx * 0.03, 0.386, 0.228, 0.007, 0.007, 0.007, DARK);
      sp(sx * 0.009, 0.365, 0.278, 0.006, 0.005, 0.005, DARK);
    }
    cap([0, 0.22, -0.18], [0, 0.13, -0.21], 0.01, 0.007, TAN_D);
    sp(0, 0.115, -0.21, 0.014, 0.025, 0.014, DARK);
    const bz2 = two ? -0.015 : 0.0;
    put(new THREE.BoxGeometry(0.13 * s, 0.012 * s, 0.07 * s), "#ffffff", P(0, 0.262, bz2), { texture: BLANKET, rotation: rot, flat: false });
    for (const sx of [-1, 1])
      put(new THREE.BoxGeometry(0.012 * s, 0.075 * s, 0.07 * s), "#ffffff", P(sx * 0.064, 0.22, bz2), { texture: BLANKET, rotation: rot, flat: false });
    return P;
  }
  const dir = (x: number, z: number) => Math.atan2(-x, -z);
  const P1 = camel(0.6, 0.45, dir(0.6, 0.45) + 0.4, 1.45, false);
  camel(-0.5, 0.52, dir(-0.5, 0.52) - 0.5, 1.35, true);
  // pack bundles on camel 1
  ball([P1(0, 0.3, -0.075)[0], P1(0, 0.3, -0.075)[1] + 0.02, P1(0, 0.3, -0.075)[2]], [0.05, 0.035, 0.05], "#d8b878");

  // ---------- campfire ----------
  const fx0 = 0.02, fz0 = 0.78;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    put(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 5), "#5e3a20", [fx0 + Math.cos(a) * 0.03, G + 0.03, fz0 + Math.sin(a) * 0.03], { rotation: [Math.sin(a) * 65, 0, -Math.cos(a) * 65] });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ball([fx0 + Math.cos(a) * 0.08, G + 0.01, fz0 + Math.sin(a) * 0.08], [0.02, 0.014, 0.02], "#6d6258");
  }
  glow(put(new THREE.ConeGeometry(0.035, 0.12, 6), "#ff7a1a", [fx0, G + 0.08, fz0]), 1.4);
  glow(put(new THREE.ConeGeometry(0.02, 0.09, 6), "#ffd23a", [fx0, G + 0.075, fz0]), 1.6);

  // ---------- props ----------
  // lantern post
  put(new THREE.CylinderGeometry(0.007, 0.009, 0.3, 6), DARK, [0.85, G + 0.15, -0.1]);
  put(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 6), DARK, [0.85, G + 0.3, -0.1]);
  glow(put(new THREE.OctahedronGeometry(0.028), "#ffcf5a", [0.85, G + 0.33, -0.1], { scale: [1, 1.3, 1] }), 1.5);
  // jars and crates
  for (const [x, z, h] of [[-0.9, -0.15, 0.08], [-0.84, -0.04, 0.06]]) {
    b.lathe([[0, 0], [0.03, 0], [0.045, 0.03], [0.035, 0.06], [0.02, 0.075], [0.025, 0.09], [0, 0.09]], {
      at: [x, G, z], segments: 8, color: [TAN_D, "#b8512f"][h > 0.07 ? 0 : 1], bone: root,
    });
  }
  put(new THREE.BoxGeometry(0.08, 0.06, 0.08), "#a9743c", [-0.2, G + 0.03, 0.8], { rotation: [0, 20, 0] });
  put(new THREE.BoxGeometry(0.06, 0.05, 0.06), "#b9824a", [-0.28, G + 0.025, 0.74], { rotation: [0, -10, 0] });
  put(new THREE.BoxGeometry(0.064, 0.012, 0.064), GOLD, [-0.28, G + 0.052, 0.74], { rotation: [0, -10, 0] });
  // cactus
  const cx0 = 0.82, cz0 = 0.4;
  b.capsule([cx0, G, cz0], [cx0, G + 0.14, cz0], 0.022, { color: "#4f9c4b", bone: root, sides: 6 });
  b.capsule([cx0, G + 0.07, cz0], [cx0 + 0.05, G + 0.08, cz0], 0.014, { color: "#4f9c4b", bone: root, sides: 6 });
  b.capsule([cx0 + 0.05, G + 0.08, cz0], [cx0 + 0.05, G + 0.13, cz0], 0.014, { color: "#4f9c4b", bone: root, sides: 6 });
  put(new THREE.SphereGeometry(0.01, 5, 4), "#ff7aa6", [cx0, G + 0.17, cz0]);
  // scattered rocks, bones, grass
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2, d = 0.85 + R() * 0.15;
    const s = 0.02 + R() * 0.04;
    ball([Math.cos(a) * d, G, Math.sin(a) * d], [s * 1.3, s, s], rockP, [0, R() * 180, 0]);
  }
  for (let i = 0; i < 10; i++) {
    const a = R() * Math.PI * 2, d = 0.5 + R() * 0.5;
    const gx = Math.cos(a) * d, gz = Math.sin(a) * d;
    if (Math.hypot(gx - PX * 1, (gz - PZ) * 1.5) < 0.5) continue;
    for (let k = 0; k < 3; k++) b.spike([gx + k * 0.01, G, gz], [(k - 1) * 0.4, 1, 0.1], 0.05 + R() * 0.03, 0.006, { color: "#9aa04a", bone: root, sides: 4 });
  }
  // sandstone arch rock at back
  ball([0.1, G + 0.04, -0.98], [0.2, 0.12, 0.1], rockP);
  put(new THREE.BoxGeometry(0.06, 0.2, 0.07), rockP, [-0.02, G + 0.1, -0.95], { rotation: [0, 8, 4] });
  put(new THREE.BoxGeometry(0.06, 0.16, 0.07), rockP, [0.2, G + 0.08, -0.95], { rotation: [0, -8, -3] });
  put(new THREE.BoxGeometry(0.3, 0.05, 0.08), rockP, [0.09, G + 0.21, -0.95], { rotation: [0, 0, 3] });
  put(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4), DARK, [0.09, G + 0.3, -0.95]);

  return b.root;
}
