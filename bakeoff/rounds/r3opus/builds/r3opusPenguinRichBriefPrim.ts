import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin & Chick",
  description:
    "A proud emperor penguin parent with a glossy blue-black back, crisp white belly, golden ear patches and an orange-pink beak stripe. A fluffy grey chick with a white face mask peeks out from the brood fold between its big black feet. They stand on a small ice floe.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "emperor_penguin" });
  const R = rng(7);
  const G = 0.03; // ice floe thickness

  // ---------- palette ----------
  const BACK = "#141b2a";
  const HEAD = "#0c0f17";
  const SHEEN = "#34486e";
  const WHITE = "#f7f5ee";
  const CREAM = "#fbeec4";
  const GOLD = "#f5b02a";
  const GOLD2 = "#f8cc55";
  const BEAK = "#15151c";
  const PINK = "#ff8466";
  const FOOT = "#1d1d24";
  const CLAW = "#3a3a44";
  const EYE = "#2a160e";
  const SHINE = "#ffffff";
  const CHICK = "#a3a6ad";
  const CHICK_L = "#c3c6cc";
  const CHICK_HEAD = "#1a1a20";
  const ICE = "#cfe6f2";
  const ICE_TOP = "#eef7fb";
  const SNOW = "#ffffff";

  const sph = (w = 12, h = 8) => new THREE.SphereGeometry(1, w, h);
  const add = (a: V, d: V, s: number): V => [a[0] + d[0] * s, a[1] + d[1] * s, a[2] + d[2] * s];
  const norm = (d: V): V => {
    const l = Math.hypot(d[0], d[1], d[2]) || 1;
    return [d[0] / l, d[1] / l, d[2] / l];
  };
  const blob = (color: string, at: V, scale: V, bone: any, dir?: V, seg: [number, number] = [12, 8]) =>
    b.part(sph(seg[0], seg[1]), color, dir ? { at, bone, scale, dir } : { at, bone, scale });
  // a geometry along Y placed from base along dir
  const along = (geo: THREE.BufferGeometry, color: string, base: V, dir: V, len: number, bone: any, scale?: V) => {
    const d = norm(dir);
    const at = add(base, d, len / 2);
    return b.part(geo, color, scale ? { at, bone, dir: d, scale } : { at, bone, dir: d });
  };

  // ---------- skeleton: parent ----------
  const root = b.joint("root", { at: [0, G + 0.3, 0] });
  const spine = b.joint("spine", { at: [0, G + 0.6, 0], parent: root });
  const chest = b.joint("chest", { at: [0, G + 0.8, 0.01], parent: spine });
  const neck = b.joint("neck", { at: [0, G + 0.9, 0.02], parent: chest });
  const head = b.joint("head", { at: [0, G + 1.0, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, G + 0.982, 0.125], parent: head });
  const tail1 = b.joint("tail1", { at: [0, G + 0.15, -0.16], parent: root });
  const tail2 = b.joint("tail2", { at: [0, G + 0.05, -0.27], parent: tail1 });

  const sides: [string, number][] = [["L", 1], ["R", -1]];
  const shoulders: any = {};
  const ankles: any = {};
  for (const [s, x] of sides) {
    const sh = b.joint("shoulder" + s, { at: [0.2 * x, G + 0.76, 0], parent: chest });
    b.joint("flipperTip" + s, { at: [0.3 * x, G + 0.46, 0.03], parent: sh });
    shoulders[s] = sh;
    const hip = b.joint("hip" + s, { at: [0.08 * x, G + 0.18, 0.02], parent: root });
    const ank = b.joint("ankle" + s, { at: [0.085 * x, G + 0.04, 0.07], parent: hip });
    b.joint("toe" + s, { at: [0.09 * x, G + 0.02, 0.2], parent: ank });
    ankles[s] = ank;
  }

  // ---------- skeleton: chick ----------
  const chick = b.joint("chickRoot", { at: [0, G + 0.13, 0.21], parent: root });
  const chickNeck = b.joint("chickNeck", { at: [0, G + 0.21, 0.25], parent: chick });
  const chickHead = b.joint("chickHead", { at: [0, G + 0.28, 0.29], parent: chickNeck });
  const chickJaw = b.joint("chickJaw", { at: [0, G + 0.262, 0.345], parent: chickHead });
  const chickFl: any = {};
  for (const [s, x] of sides) {
    chickFl[s] = b.joint("chickFlipper" + s, { at: [0.075 * x, G + 0.16, 0.22], parent: chick });
  }

  // ---------- ice floe ----------
  b.part(new THREE.CylinderGeometry(0.5, 0.47, G, 9), ICE, { at: [0, G / 2, 0], bone: root });
  b.part(new THREE.CylinderGeometry(0.44, 0.44, 0.006, 9), ICE_TOP, { at: [0, G + 0.001, 0.0], bone: root });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + R() * 0.5;
    const r = 0.36 + R() * 0.08;
    const s = 0.03 + R() * 0.03;
    blob(SNOW, [Math.cos(a) * r, G, Math.sin(a) * r], [s * 1.4, s * 0.6, s], root, undefined, [7, 5]);
  }

  // ---------- parent body ----------
  blob(BACK, [0, G + 0.42, 0], [0.25, 0.4, 0.23], root);
  blob(BACK, [0, G + 0.72, 0.01], [0.19, 0.22, 0.18], chest);
  blob(WHITE, [0, G + 0.4, 0.045], [0.22, 0.36, 0.2], root);
  blob(WHITE, [0, G + 0.72, 0.05], [0.16, 0.19, 0.15], chest);
  blob(CREAM, [0, G + 0.8, 0.075], [0.13, 0.1, 0.12], chest);
  blob(GOLD2, [0, G + 0.86, 0.08], [0.1, 0.075, 0.1], neck);
  // brood fold of belly skin over the chick
  blob(WHITE, [0, G + 0.24, 0.13], [0.17, 0.1, 0.13], root);
  // glossy sheen strokes on back
  blob(SHEEN, [0.1, G + 0.55, -0.19], [0.03, 0.12, 0.014], spine, [0.15, 1, 0.1]);
  blob(SHEEN, [-0.09, G + 0.6, -0.19], [0.025, 0.1, 0.014], spine, [-0.15, 1, 0.1]);
  blob(SHEEN, [0.04, G + 0.74, -0.16], [0.02, 0.07, 0.012], chest, [0.1, 1, 0.3]);
  // tail
  along(new THREE.ConeGeometry(0.06, 0.16, 6), BACK, [0, G + 0.17, -0.14], [0, -0.75, -1], 0.16, tail1, [1, 1, 0.5]);

  // ---------- neck & head ----------
  blob(HEAD, [0, G + 0.9, 0.01], [0.12, 0.12, 0.12], neck);
  blob(HEAD, [0, G + 1.0, 0.03], [0.115, 0.11, 0.12], head);
  blob(SHEEN, [0.03, G + 1.09, 0.0], [0.03, 0.012, 0.06], head, undefined, [8, 6]);
  for (const [, x] of sides) {
    blob(GOLD, [0.08 * x, G + 0.94, -0.005], [0.04, 0.085, 0.055], head, [0, 1, -0.25]);
    blob(GOLD2, [0.075 * x, G + 0.885, 0.04], [0.03, 0.04, 0.04], neck);
    // eye + highlight
    b.part(new THREE.SphereGeometry(0.016, 8, 6), EYE, { at: [0.085 * x, G + 1.035, 0.1], bone: head });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), SHINE, { at: [0.095 * x, G + 1.042, 0.108], bone: head });
  }

  // ---------- beak (separate upper and lower jaw) ----------
  const upBase: V = [0, G + 1.0, 0.13];
  along(new THREE.ConeGeometry(0.024, 0.17, 6), BEAK, upBase, [0, -0.2, 1], 0.17, head, [1, 1, 0.75]);
  const loBase: V = [0, G + 0.982, 0.125];
  along(new THREE.ConeGeometry(0.019, 0.15, 6), BEAK, loBase, [0, -0.28, 1], 0.15, jaw, [1, 1, 0.7]);
  const loDir = norm([0, -0.28, 1]);
  for (const [, x] of sides) {
    const c = add(loBase, loDir, 0.05);
    blob(PINK, [0.011 * x, c[1], c[2]], [0.006, 0.011, 0.045], jaw, loDir, [8, 6]);
  }

  // ---------- flippers ----------
  for (const [s, x] of sides) {
    const base: V = [0.2 * x, G + 0.76, 0];
    const tip: V = [0.3 * x, G + 0.46, 0.03];
    const d: V = [tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]];
    const mid: V = [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2];
    blob(BACK, mid, [0.022, 0.17, 0.065], shoulders[s], d);
    blob(WHITE, [mid[0] - 0.008 * x, mid[1], mid[2] + 0.004], [0.018, 0.15, 0.055], shoulders[s], d);
    blob(SHEEN, [mid[0] + 0.012 * x, mid[1] + 0.03, mid[2]], [0.012, 0.08, 0.03], shoulders[s], d, [8, 6]);
  }

  // ---------- legs & feet ----------
  for (const [s, x] of sides) {
    const ank = ankles[s];
    along(new THREE.CapsuleGeometry(0.035, 0.08, 3, 6), FOOT, [0.08 * x, G + 0.16, 0.03], [0.005 * x, -1, 0.3], 0.12, ank);
    blob(FOOT, [0.085 * x, G + 0.022, 0.12], [0.06, 0.022, 0.07], ank, undefined, [10, 6]);
    for (let t = -1; t <= 1; t++) {
      const start: V = [0.085 * x + t * 0.022, G + 0.018, 0.14];
      const end: V = [0.085 * x + t * 0.045, G + 0.015, 0.215 - Math.abs(t) * 0.015];
      const d: V = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
      along(new THREE.CapsuleGeometry(0.014, 0.05, 3, 6), FOOT, start, d, 0.078, ank, [1, 1, 0.7]);
      along(new THREE.ConeGeometry(0.008, 0.025, 5), CLAW, end, d, 0.025, ank);
    }
  }

  // ---------- chick ----------
  blob(CHICK, [0, G + 0.13, 0.21], [0.085, 0.095, 0.08], chick);
  blob(CHICK, [0, G + 0.21, 0.25], [0.06, 0.06, 0.06], chickNeck);
  blob(CHICK_HEAD, [0, G + 0.28, 0.29], [0.058, 0.056, 0.058], chickHead);
  blob(WHITE, [0, G + 0.27, 0.32], [0.05, 0.04, 0.03], chickHead);
  for (const [s, x] of sides) {
    b.part(new THREE.SphereGeometry(0.008, 6, 5), CHICK_HEAD, { at: [0.022 * x, G + 0.285, 0.345], bone: chickHead });
    b.part(new THREE.SphereGeometry(0.0028, 4, 3), SHINE, { at: [0.025 * x, G + 0.289, 0.352], bone: chickHead });
    along(new THREE.CapsuleGeometry(0.016, 0.03, 3, 6), CHICK, [0.075 * x, G + 0.16, 0.22], [x, -1.1, 0.25], 0.06, chickFl[s], [0.6, 1, 1]);
  }
  along(new THREE.ConeGeometry(0.009, 0.03, 5), BEAK, [0, G + 0.266, 0.345], [0, -0.1, 1], 0.03, chickHead);
  along(new THREE.ConeGeometry(0.006, 0.024, 5), BEAK, [0, G + 0.259, 0.343], [0, -0.3, 1], 0.024, chickJaw);
  // fluffy down tufts
  const tuft = (center: V, sc: V, bone: any, n: number) => {
    for (let i = 0; i < n; i++) {
      const az = R() * Math.PI * 2;
      const el = (R() - 0.35) * 1.4;
      const nx = Math.cos(el) * Math.sin(az);
      const ny = Math.sin(el);
      const nz = Math.cos(el) * Math.cos(az);
      const p: V = [center[0] + nx * sc[0] * 0.95, center[1] + ny * sc[1] * 0.95, center[2] + nz * sc[2] * 0.95];
      const len = 0.025 + R() * 0.015;
      along(new THREE.ConeGeometry(0.014, len, 4), R() < 0.5 ? CHICK : CHICK_L, p, [nx, ny + 0.3, nz], len, bone);
    }
  };
  tuft([0, G + 0.13, 0.21], [0.085, 0.095, 0.08], chick, 40);
  tuft([0, G + 0.21, 0.25], [0.06, 0.06, 0.06], chickNeck, 14);
  // little crown fluff
  for (let i = 0; i < 4; i++) {
    along(new THREE.ConeGeometry(0.008, 0.025, 4), CHICK_HEAD, [(i - 1.5) * 0.012, G + 0.33, 0.29 - i * 0.004], [(i - 1.5) * 0.4, 1, -0.2], 0.025, chickHead);
  }

  return b.root;
}
