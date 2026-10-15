import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { countershade, grain, mix, mottle, noise, paint, spots } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A round desert island with a turquoise pond, four chunky palms, a striped round tent, a teal shade tent with rug and tea, a campfire, and three toy-like camels (two standing, one resting).",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type V = [number, number, number];

const D = Math.PI / 180;
const G = 0.16; // top of the sand base

const RED = "#d9482f";
const RED_D = "#b8321f";
const CREAM = "#fbe9c6";
const TEAL = "#2f9aa0";
const TEAL_D = "#1f7a82";
const GOLD = "#f2b632";
const WOOD = "#7a4a2b";
const WOOD_D = "#5a3a22";
const ROPE = "#cdb084";

const LEAF1: OutlinePoint[] = [
  [0, -0.02],
  [0.06, -0.07],
  [0.1, -0.045],
  [0.16, -0.085],
  [0.2, -0.055],
  [0.27, -0.075],
  [0.3, -0.04],
  [0.3, 0.04],
  [0.27, 0.075],
  [0.2, 0.055],
  [0.16, 0.085],
  [0.1, 0.045],
  [0.06, 0.07],
  [0, 0.02],
];
const LEAF2: OutlinePoint[] = [
  [0, -0.04],
  [0.05, -0.075],
  [0.09, -0.05],
  [0.15, -0.07],
  [0.19, -0.04],
  [0.25, -0.045],
  [0.3, -0.02],
  [0.35, 0, "sharp"],
  [0.3, 0.02],
  [0.25, 0.045],
  [0.19, 0.04],
  [0.15, 0.07],
  [0.09, 0.05],
  [0.05, 0.075],
  [0, 0.04],
];

const scaleO = (o: OutlinePoint[], k: number): OutlinePoint[] =>
  o.map((p) => (p.length === 3 ? ([p[0] * k, p[1] * k, "sharp"] as OutlinePoint) : ([p[0] * k, p[1] * k] as OutlinePoint)));

/** Yaw about Y applied after a tilt about X and Z (degrees). */
const Q = (yaw = 0, tx = 0, tz = 0) =>
  new THREE.Quaternion()
    .setFromEuler(new THREE.Euler(tx * D, 0, tz * D))
    .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw * D));

const dirv = (a: number, elDeg: number): V => {
  const e = elDeg * D;
  return [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];
};

/** Local-to-model mapping for a prop placed at (x, z), turned by yaw degrees, scaled by S, standing on the sand. */
const frameOf = (x: number, z: number, yaw: number, S = 1) => {
  const c = Math.cos(yaw * D);
  const s = Math.sin(yaw * D);
  const T = (p: V): V => [x + (p[0] * c + p[2] * s) * S, G + p[1] * S, z + (-p[0] * s + p[2] * c) * S];
  const Dv = (p: V): V => [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
  return { T, Dv };
};

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(11);

  const put = (geo: THREE.BufferGeometry, color: Fill, at: V, o: PartOptions = {}) =>
    b.part(geo, color, { bone: base, at, flat: true, ...o });
  const ell = (at: V, r: V, color: Fill, o: PartOptions = {}) =>
    put(new THREE.SphereGeometry(1, 8, 6), color, at, { scale: r, ...o });
  const tube = (pts: V[], r: number | number[], color: Fill, o: SweepOptions = {}) =>
    b.sweep(catmull(pts), r, color, { bone: base, sides: 6, smooth: false, ...o });
  const rod = (a: V, c: V, r: number, color: Fill, sides = 5) => b.rod(a, c, r, color, { bone: base, sides });

  // ---------------------------------------------------------------- base island
  const sandTop = mottle("#efcf98", "#e2bb7c", { size: 0.22, seed: 3 });
  const basePaint = paint((p, n) => (n.y < 0.6 ? (p.y < 0.07 ? "#a8764a" : "#c99a60") : sandTop));
  b.lathe(
    [
      [0, 0],
      [1.28, 0],
      [1.36, 0.05],
      [1.35, 0.12],
      [1.3, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 16, color: basePaint, bone: base, name: "island" },
  );

  // dunes at the rim
  const duneP = mottle("#f1d49f", "#e6c183", { size: 0.2, seed: 5 });
  const dunes: Array<[number, number, V, number]> = [
    [-1.05, -0.2, [0.22, 0.1, 0.3], 20],
    [1.08, 0.2, [0.2, 0.08, 0.25], -15],
    [-0.3, 1.0, [0.3, 0.07, 0.18], 10],
    [0.35, 1.06, [0.26, 0.06, 0.14], -20],
    [-0.95, 0.85, [0.22, 0.07, 0.18], 35],
  ];
  for (const [x, z, r, yaw] of dunes) ell([x, G - 0.025, z], r, duneP, { quat: Q(yaw) });

  // ---------------------------------------------------------------- pond
  const waterP = mottle("#3fb7c4", "#6fd6d6", { size: 0.14, seed: 9 });
  put(new THREE.CylinderGeometry(1, 1, 0.03, 16), waterP, [0, G, 0.05], { scale: [0.43, 1, 0.33] });
  put(new THREE.CylinderGeometry(1, 1, 0.03, 16), "#2d9fb5", [0, G + 0.003, 0.05], { scale: [0.34, 1, 0.25] });
  put(new THREE.TorusGeometry(0.1, 0.004, 4, 12), "#c9f3f3", [0.08, G + 0.019, 0.1], { quat: Q(0, 90) });
  ell([-0.15, G + 0.019, 0.0], [0.07, 0.003, 0.018], "#c9f3f3");
  ell([0.18, G + 0.019, 0.12], [0.05, 0.003, 0.014], "#c9f3f3");
  const pads: Array<[number, number]> = [
    [-0.16, 0.15],
    [-0.05, -0.08],
    [0.2, 0.0],
  ];
  for (const [x, z] of pads) put(new THREE.CylinderGeometry(0.055, 0.055, 0.006, 7), "#4cae4f", [x, G + 0.02, z]);
  put(new THREE.ConeGeometry(0.03, 0.05, 6), "#f48fb1", [0.2, G + 0.048, 0.0]);
  put(new THREE.SphereGeometry(0.014, 5, 4), GOLD, [0.2, G + 0.03, 0.0]);

  const stoneCols = ["#a99a88", "#8f8272", "#bfae98"];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const s = 0.04 + R() * 0.03;
    put(
      new THREE.DodecahedronGeometry(s, 0),
      stoneCols[i % 3],
      [0.48 * Math.cos(a), G + s * 0.25, 0.05 + 0.38 * Math.sin(a)],
      { scale: [1, 0.6, 0.9], quat: Q(R() * 360) },
    );
  }

  // reeds and cattails
  const reeds: Array<[number, number]> = [
    [-0.42, 0.3],
    [-0.5, 0.22],
    [0.42, 0.32],
    [-0.05, 0.42],
  ];
  reeds.forEach(([x, z], k) => {
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + k;
      const px = x + Math.cos(a) * 0.035;
      const pz = z + Math.sin(a) * 0.035;
      const len = 0.17 + R() * 0.12;
      b.spike([px, G - 0.01, pz], [Math.cos(a) * 0.18, 1, Math.sin(a) * 0.18], len, 0.012, i % 2 ? "#6cbf4b" : "#4f9f3f", {
        bone: base,
        sides: 4,
      });
      if (i === 0) {
        b.capsule([px, G + len * 0.62, pz], [px + 0.002, G + len * 0.62 + 0.05, pz], 0.013, "#7a4a2b", {
          bone: base,
          sides: 5,
        });
      }
    }
  });

  // ---------------------------------------------------------------- palms
  const barkP = paint((p) => (Math.floor(p.y / 0.05) % 2 === 0 ? "#8b5a36" : "#a97848"));
  const frond = (top: V, az: number, el1: number, el2: number, k: number, col: string) => {
    const a = az * D;
    const d1 = dirv(a, el1);
    const d2 = dirv(a, el2);
    const perp: V = [-Math.cos(a), 0, Math.sin(a)];
    const e1: V = [top[0] + d1[0] * 0.3 * k, top[1] + d1[1] * 0.3 * k, top[2] + d1[2] * 0.3 * k];
    const e2: V = [e1[0] + d2[0] * 0.35 * k, e1[1] + d2[1] * 0.35 * k, e1[2] + d2[2] * 0.35 * k];
    b.extrude(scaleO(LEAF1, k), { at: top, x: d1, y: perp, thickness: 0.012, color: col, bone: base });
    b.extrude(scaleO(LEAF2, k), { at: e1, x: d2, y: perp, thickness: 0.012, color: col, bone: base });
    rod(top, e1, 0.006, "#2c7a37", 4);
    rod(e1, e2, 0.005, "#2c7a37", 4);
  };
  const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number) => {
    const r = rng(seed);
    const top: V = [x + lx, G + h, z + lz];
    tube(
      [
        [x, G - 0.02, z],
        [x + lx * 0.2, G + h * 0.35, z + lz * 0.2],
        [x + lx * 0.6, G + h * 0.72, z + lz * 0.6],
        top,
      ],
      [0.075, 0.05, 0.04, 0.034],
      barkP,
    );
    ell([top[0], top[1] + 0.01, top[2]], [0.075, 0.055, 0.075], "#6e4a2a");
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + 0.4;
      ell([top[0] + Math.cos(a) * 0.06, top[1] - 0.045, top[2] + Math.sin(a) * 0.06], [0.04, 0.04, 0.04], "#5a3a22");
    }
    const k = 0.75 + h * 0.5;
    for (let i = 0; i < 8; i++) {
      const az = i * 45 + r() * 14;
      frond(
        [top[0], top[1] + 0.03, top[2]],
        az,
        20 + r() * 14,
        -(14 + r() * 18),
        k * (0.9 + r() * 0.25),
        i % 2 ? "#3c9a43" : "#53b84a",
      );
    }
    for (let i = 0; i < 3; i++) frond([top[0], top[1] + 0.05, top[2]], i * 120 + 30, 65, 35, k * 0.55, "#7cd05a");
  };
  palm(0.5, -0.2, 1.0, -0.15, 0.1, 21);
  palm(-0.48, -0.12, 0.85, 0.16, 0.06, 22);
  palm(0.12, -0.48, 0.68, 0.0, 0.14, 23);
  palm(0.98, 0.0, 0.55, -0.1, 0.1, 24);

  // ---------------------------------------------------------------- tent A (round striped tent)
  const cloth = (ca: string, cb: string, key: (p: THREE.Vector3) => number) =>
    paint((p) => mix(key(p) % 2 === 0 ? ca : cb, "#5a2a1a", 0.22 * noise(p, 0.07, 3)));

  const tentA = (x: number, z: number, yaw: number) => {
    const { T, Dv } = frameOf(x, z, yaw);
    const Rr = 0.36;
    const H = 0.5;
    const yr = yaw * D;
    const stripe = cloth(RED, CREAM, (p) =>
      Math.floor((Math.atan2(p.x - x, p.z - z) - yr + Math.PI / 8) / (Math.PI / 4) + 16),
    );
    put(new THREE.ConeGeometry(Rr, H, 8, 1, false, Math.PI / 8), stripe, T([0, H / 2, 0]), { quat: Q(yaw) });
    put(new THREE.CylinderGeometry(Rr * 1.04, Rr * 1.07, 0.06, 8, 1, false, Math.PI / 8), RED_D, T([0, 0.03, 0]), {
      quat: Q(yaw),
    });
    put(new THREE.CylinderGeometry(Rr * 0.64, Rr * 0.66, 0.025, 8, 1, false, Math.PI / 8), GOLD, T([0, 0.17, 0]), {
      quat: Q(yaw),
    });
    // finial
    rod(T([0, H - 0.02, 0]), T([0, H + 0.14, 0]), 0.012, WOOD);
    ell(T([0, H + 0.155, 0]), [0.032, 0.032, 0.032], GOLD);
    b.extrude(
      [
        [0, 0],
        [0.15, -0.035],
        [0, -0.07],
      ],
      { at: T([0, H + 0.12, 0]), x: Dv([0, 0, -1]), y: [0, 1, 0], thickness: 0.006, color: RED, bone: base },
    );
    // door on the +Z face
    const d0 = 0.9239 * Rr;
    const sl = Math.hypot(H, d0);
    const su: V = [0, H / sl, -d0 / sl];
    const nn: V = [0, d0 / sl, H / sl];
    const y0 = 0.04;
    const dist0 = d0 * (1 - y0 / H);
    const onFace = (u: number, off: number): V => [u, y0 + 0, dist0].map((v, i) => v + nn[i] * off) as V;
    const arch = (w: number, h: number): OutlinePoint[] => [
      [-w, 0],
      [w, 0],
      [w * 0.85, h * 0.55],
      [w * 0.4, h * 0.88],
      [0, h],
      [-w * 0.4, h * 0.88],
      [-w * 0.85, h * 0.55],
    ];
    b.extrude(arch(0.085, 0.2), {
      at: T(onFace(0, 0.003)),
      x: Dv([1, 0, 0]),
      y: Dv(su),
      thickness: 0.008,
      color: GOLD,
      bone: base,
    });
    b.extrude(arch(0.062, 0.17), {
      at: T(onFace(0, 0.007)),
      x: Dv([1, 0, 0]),
      y: Dv(su),
      thickness: 0.01,
      color: "#3b2418",
      bone: base,
    });
    for (const s of [1, -1]) {
      const at = T(onFace(s * 0.066, 0.016));
      const aimP = T(onFace(s * 0.066, 0.016).map((v, i) => v + su[i] * 0.2) as V);
      const flap = b.joint(s > 0 ? "flapL" : "flapR", { parent: base, at, aim: aimP, role: "hinge" });
      b.extrude(
        [
          [0, 0],
          [0.09, 0],
          [0, 0.2],
        ],
        { at, x: Dv([s, 0, 0]), y: Dv(su), thickness: 0.008, color: RED_D, bone: flap },
      );
      ell(T(onFace(s * 0.15, 0.025)), [0.014, 0.014, 0.014], GOLD, { bone: flap });
    }
    // ropes and pegs
    for (const k of [1, 2, 3, 4, 5, 6]) {
      const th = Math.PI / 8 + (k * Math.PI) / 4;
      const rv = Rr * 0.4;
      const from = T([rv * Math.sin(th), 0.3, rv * Math.cos(th)]);
      const to = T([Rr * 1.75 * Math.sin(th), 0.03, Rr * 1.75 * Math.cos(th)]);
      rod(from, to, 0.005, ROPE, 4);
      put(new THREE.CylinderGeometry(0.012, 0.01, 0.08, 5), WOOD_D, T([Rr * 1.75 * Math.sin(th), 0.02, Rr * 1.75 * Math.cos(th)]));
    }
  };
  tentA(-0.6, -0.6, 28);

  // ---------------------------------------------------------------- tent B (shade canopy, rug, tea)
  const tentB = (x: number, z: number, yaw: number) => {
    const { T, Dv } = frameOf(x, z, yaw);
    const ax = Dv([1, 0, 0]);
    const stripeB = cloth(TEAL, CREAM, (p) => Math.floor(((p.x - x) * ax[0] + (p.z - z) * ax[2]) / 0.09 + 40));
    const hFront = 0.36;
    const hBack = 0.28;
    const tilt = -Math.atan((hFront - hBack) / 0.44) / D;
    for (const sx of [1, -1])
      for (const [sz, h] of [
        [1, hFront],
        [-1, hBack],
      ] as Array<[number, number]>) {
        rod(T([sx * 0.3, -0.01, sz * 0.22]), T([sx * 0.3, h, sz * 0.22]), 0.013, WOOD);
        ell(T([sx * 0.3, h + 0.01, sz * 0.22]), [0.02, 0.02, 0.02], GOLD);
      }
    put(new THREE.BoxGeometry(0.72, 0.02, 0.56), stripeB, T([0, 0.33, 0]), { quat: Q(yaw, tilt) });
    put(new THREE.BoxGeometry(0.74, 0.012, 0.03), TEAL_D, T([0, 0.352 + 0.04, -0.27]), { quat: Q(yaw, tilt) });
    // fringe along the front edge
    for (let i = 0; i < 11; i++) {
      const u = -0.3 + i * 0.06;
      put(new THREE.ConeGeometry(0.035, 0.06, 4), i % 2 ? GOLD : RED, T([u, 0.335, 0.27]), { quat: Q(yaw, 180) });
    }
    // back wall
    const wallP = cloth(TEAL_D, "#2b8f96", (p) => Math.floor(((p.x - x) * ax[0] + (p.z - z) * ax[2]) / 0.06 + 60));
    put(new THREE.BoxGeometry(0.64, 0.27, 0.012), wallP, T([0, 0.145, -0.235]), { quat: Q(yaw) });
    put(new THREE.BoxGeometry(0.66, 0.02, 0.02), GOLD, T([0, 0.1, -0.225]), { quat: Q(yaw) });
    // rug
    const rug = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><rect width="64" height="40" fill="#b8321f"/><rect x="3" y="3" width="58" height="34" fill="none" stroke="#f2b632" stroke-width="2"/><polygon points="32,6 50,20 32,34 14,20" fill="#2f9aa0"/><polygon points="32,12 42,20 32,28 22,20" fill="#fbe9c6"/><circle cx="32" cy="20" r="3" fill="#b8321f"/><circle cx="9" cy="10" r="2.5" fill="#fbe9c6"/><circle cx="55" cy="10" r="2.5" fill="#fbe9c6"/><circle cx="9" cy="30" r="2.5" fill="#fbe9c6"/><circle cx="55" cy="30" r="2.5" fill="#fbe9c6"/></svg>`,
      { size: 256 },
    );
    b.part(new THREE.PlaneGeometry(0.5, 0.32), "#ffffff", {
      bone: base,
      at: T([0, 0.006, 0.02]),
      quat: Q(yaw, -90),
      texture: rug,
    });
    // cushions
    ell(T([-0.17, 0.035, -0.12]), [0.09, 0.035, 0.07], GOLD, { quat: Q(yaw, 0, 8) });
    ell(T([0.0, 0.035, -0.15]), [0.08, 0.035, 0.065], RED, { quat: Q(yaw, 0, -6) });
    ell(T([0.17, 0.035, -0.12]), [0.09, 0.035, 0.07], "#7e57c2", { quat: Q(yaw, 0, 5) });
    // tea tray
    put(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 10), GOLD, T([0.02, 0.016, 0.1]));
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.055, 0.03],
        [0.05, 0.06],
        [0.03, 0.075],
        [0, 0.078],
      ],
      { at: T([0.0, 0.022, 0.1]), color: "#e8e1d4", segments: 8, bone: base },
    );
    ell(T([0, 0.105, 0.1]), [0.014, 0.014, 0.014], GOLD);
    rod(T([0.04, 0.05, 0.1]), T([0.085, 0.085, 0.1]), 0.008, "#e8e1d4", 5);
    b.capsule(T([-0.04, 0.045, 0.1]), T([-0.075, 0.085, 0.1]), 0.007, "#e8e1d4", { bone: base, sides: 5 });
    for (const cx of [0.06, 0.09]) put(new THREE.CylinderGeometry(0.014, 0.01, 0.025, 6), CREAM, T([cx, 0.034, 0.145]));
    // hanging lantern
    rod(T([0.27, 0.34, 0.22]), T([0.27, 0.27, 0.22]), 0.004, WOOD_D, 4);
    glow(put(new THREE.BoxGeometry(0.05, 0.06, 0.05), "#ffb347", T([0.27, 0.24, 0.22]), { quat: Q(yaw) }), 1.5);
    put(new THREE.ConeGeometry(0.04, 0.03, 4), WOOD_D, T([0.27, 0.285, 0.22]), { quat: Q(yaw) });
    put(new THREE.BoxGeometry(0.056, 0.01, 0.056), WOOD_D, T([0.27, 0.21, 0.22]), { quat: Q(yaw) });
  };
  tentB(0.65, -0.62, -28);

  // ---------------------------------------------------------------- camels
  const camel = (
    x: number,
    z: number,
    yaw: number,
    rest: boolean,
    coat: string,
    coatDark: string,
    blanket: string,
    trim: string,
  ) => {
    const S = 0.19;
    const dy = rest ? -0.6 : 0;
    const { T } = frameOf(x, z, yaw, S);
    const fur = countershade(mottle(coat, coatDark, { size: 0.2, seed: 7 }), "#f0d9a8", { level: -0.2 });
    const E = (c: V, r: V, col: Fill, tx = 0, tz = 0) =>
      ell(T(c), [r[0] * S, r[1] * S, r[2] * S], col, { quat: Q(yaw, tx, tz) });
    // body
    E([0, 1.25 + dy, 0], [0.45, 0.45, 0.95], fur);
    E([0, 1.2 + dy, 0.65], [0.4, 0.42, 0.4], fur);
    E([0, 1.25 + dy, -0.7], [0.4, 0.43, 0.4], fur);
    E([0, 1.78 + dy, -0.15], [0.3, 0.38, 0.35], fur);
    E([0, 2.05 + dy, -0.15], [0.18, 0.15, 0.2], coatDark);
    // blanket and trims
    E([0, 1.25 + dy, 0.2], [0.485, 0.485, 0.2], blanket);
    E([0, 1.25 + dy, 0.03], [0.5, 0.5, 0.035], trim);
    E([0, 1.25 + dy, 0.37], [0.5, 0.5, 0.035], trim);
    for (const s of [1, -1]) {
      for (const tz of [0.03, 0.2, 0.37]) {
        put(new THREE.ConeGeometry(0.04 * S, 0.15 * S, 5), tz === 0.2 ? GOLD : trim, T([s * 0.5, 0.78 + dy, tz]), {
          quat: Q(yaw, 180),
        });
      }
    }
    // neck, collar, bell
    tube(
      [T([0, 1.45 + dy, 0.75]), T([0, 1.9 + dy, 1.05]), T([0, 2.3 + dy, 1.25])],
      [0.27 * S, 0.2 * S, 0.16 * S],
      fur,
    );
    E([0, 1.9 + dy, 1.05], [0.25, 0.25, 0.05], trim, -58);
    ell(T([0, 1.77 + dy, 1.26]), [0.06 * S, 0.06 * S, 0.06 * S], GOLD);
    // head
    E([0, 2.42 + dy, 1.45], [0.2, 0.2, 0.33], fur, 18);
    E([0, 2.3 + dy, 1.77], [0.13, 0.12, 0.18], "#f0d9a8", 18);
    E([0, 2.18 + dy, 1.72], [0.1, 0.07, 0.17], "#f0d9a8", 18);
    E([0, 2.3 + dy, 1.7], [0.14, 0.13, 0.03], blanket, 18);
    for (const s of [1, -1]) {
      E([s * 0.055, 2.265 + dy, 1.93], [0.025, 0.025, 0.025], "#3b2418");
      E([s * 0.16, 2.5 + dy, 1.52], [0.075, 0.075, 0.075], "#ffffff");
      E([s * 0.2, 2.5 + dy, 1.57], [0.045, 0.045, 0.045], "#2a1a12");
      E([s * 0.215, 2.52 + dy, 1.6], [0.016, 0.016, 0.016], "#ffffff");
      E([s * 0.155, 2.585 + dy, 1.5], [0.085, 0.03, 0.08], coatDark, 18);
      E([s * 0.2, 2.34 + dy, 1.6], [0.045, 0.045, 0.03], "#f2a39a");
      put(new THREE.ConeGeometry(0.06 * S, 0.17 * S, 5), coatDark, T([s * 0.14, 2.7 + dy, 1.28]), {
        quat: Q(yaw, -20, -s * 25),
      });
      put(new THREE.ConeGeometry(0.03 * S, 0.1 * S, 4), "#f2a39a", T([s * 0.14, 2.69 + dy, 1.31]), {
        quat: Q(yaw, -20, -s * 25),
      });
    }
    for (let i = 0; i < 3; i++)
      put(new THREE.ConeGeometry(0.035 * S, 0.14 * S, 4), coatDark, T([(i - 1) * 0.05, 2.66 + dy, 1.42 - i * 0.02]), {
        quat: Q(yaw, -25 - i * 8, (i - 1) * 18),
      });
    // legs
    for (const s of [1, -1]) {
      if (!rest) {
        tube(
          [T([s * 0.3, 1.05, 0.62]), T([s * 0.3, 0.62, 0.66]), T([s * 0.27, 0.3, 0.62]), T([s * 0.27, 0.09, 0.62])],
          [0.15 * S, 0.11 * S, 0.085 * S, 0.075 * S],
          fur,
        );
        tube(
          [T([s * 0.3, 1.05, -0.62]), T([s * 0.3, 0.6, -0.7]), T([s * 0.28, 0.32, -0.6]), T([s * 0.27, 0.09, -0.65])],
          [0.15 * S, 0.11 * S, 0.085 * S, 0.075 * S],
          fur,
        );
        put(new THREE.CylinderGeometry(0.11 * S, 0.12 * S, 0.06 * S, 6), "#6b4a34", T([s * 0.27, 0.03, 0.62]));
        put(new THREE.CylinderGeometry(0.11 * S, 0.12 * S, 0.06 * S, 6), "#6b4a34", T([s * 0.27, 0.03, -0.65]));
      } else {
        tube(
          [T([s * 0.3, 0.55, 0.62]), T([s * 0.42, 0.12, 0.7]), T([s * 0.34, 0.11, 1.2])],
          [0.15 * S, 0.11 * S, 0.09 * S],
          fur,
        );
        tube(
          [T([s * 0.3, 0.55, -0.6]), T([s * 0.46, 0.12, -0.7]), T([s * 0.36, 0.11, -0.1])],
          [0.15 * S, 0.11 * S, 0.09 * S],
          fur,
        );
        E([s * 0.34, 0.1, 1.27], [0.1, 0.09, 0.1], "#6b4a34");
        E([s * 0.36, 0.1, -0.03], [0.1, 0.09, 0.1], "#6b4a34");
      }
    }
    // tail
    tube(
      [T([0, 1.5 + dy, -1.1]), T([0, 1.2 + dy, -1.35]), T([0, 0.85 + dy, -1.38])],
      [0.06 * S, 0.045 * S, 0.035 * S],
      fur,
    );
    E([0, 0.76 + dy, -1.38], [0.075, 0.13, 0.075], coatDark);
  };
  camel(0.7, 0.55, -125, false, "#dba35f", "#b57a3c", TEAL, GOLD);
  camel(-0.75, 0.35, 115, true, "#e6b673", "#c08a4c", RED, CREAM);

  // ---------------------------------------------------------------- campfire
  const fx = 0.05;
  const fz = -0.9;
  put(new THREE.CylinderGeometry(0.13, 0.13, 0.006, 8), "#3a2f2a", [fx, G + 0.002, fz]);
  for (let i = 0; i < 6; i++) {
    const a = i * 1.047 + 0.3;
    rod(
      [fx + Math.cos(a) * 0.13, G + 0.02, fz + Math.sin(a) * 0.13],
      [fx + Math.cos(a) * 0.01, G + 0.11, fz + Math.sin(a) * 0.01],
      0.018,
      i % 2 ? WOOD : WOOD_D,
      5,
    );
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    put(new THREE.DodecahedronGeometry(0.035, 0), stoneCols[i % 3], [fx + Math.cos(a) * 0.17, G + 0.012, fz + Math.sin(a) * 0.17], {
      scale: [1, 0.6, 1],
      quat: Q(i * 40),
    });
  }
  glow(put(new THREE.ConeGeometry(0.06, 0.17, 5), "#ff7a1f", [fx, G + 0.15, fz]), 1.4);
  glow(put(new THREE.ConeGeometry(0.035, 0.12, 5), "#ffd23f", [fx, G + 0.13, fz]), 1.6);
  glow(put(new THREE.ConeGeometry(0.025, 0.09, 4), "#ff9a2f", [fx + 0.04, G + 0.11, fz + 0.02]), 1.4);
  const smoke: Array<[number, number, number, number]> = [
    [0.01, 0.3, 0.0, 0.035],
    [0.03, 0.42, 0.01, 0.047],
    [0.0, 0.56, -0.01, 0.06],
  ];
  for (const [dx, h, dz, r] of smoke) ell([fx + dx, G + h, fz + dz], [r, r * 0.85, r], "#e3dedb");

  // ---------------------------------------------------------------- props: crates, sacks, jars, cactus, rocks
  const woodP = grain("#a8743f", "#8a5a2c", { size: 0.02, axis: "x", seed: 4 });
  const crate = (x: number, z: number, yaw: number, y = 0) => {
    put(new THREE.BoxGeometry(0.16, 0.13, 0.16), woodP, [x, G + y + 0.065, z], { quat: Q(yaw) });
    put(new THREE.BoxGeometry(0.165, 0.135, 0.025), WOOD_D, [x, G + y + 0.065, z], { quat: Q(yaw) });
    put(new THREE.BoxGeometry(0.025, 0.135, 0.165), WOOD_D, [x, G + y + 0.065, z], { quat: Q(yaw) });
  };
  crate(-0.95, -0.15, 20);
  crate(-0.98, -0.32, -10);
  crate(-0.95, -0.2, 35, 0.13);
  const sack = (x: number, z: number, col: string) => {
    ell([x, G + 0.07, z], [0.1, 0.1, 0.085], col);
    put(new THREE.ConeGeometry(0.04, 0.06, 5), col, [x, G + 0.18, z]);
    rod([x - 0.03, G + 0.15, z], [x + 0.03, G + 0.15, z], 0.008, WOOD_D, 4);
  };
  sack(-0.3, -0.98, "#d9c28f");
  sack(-0.45, -1.0, "#c9a870");
  const jarBand = paint((_p, _n, s) => (s[0] > 0.07 && s[0] < 0.095 ? TEAL : "#c8683a"));
  const jar = (x: number, z: number, sc: number) =>
    b.lathe(
      [
        [0, 0],
        [0.045, 0],
        [0.075, 0.05],
        [0.07, 0.1],
        [0.04, 0.14],
        [0.05, 0.165],
        [0, 0.165],
      ],
      { at: [x, G, z], color: jarBand, segments: 8, bone: base, ...(sc === 1 ? {} : {}) },
    );
  jar(0.98, -0.5, 1);
  jar(1.05, -0.35, 1);
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 6), WOOD, [0.98, G + 0.175, -0.5]);

  const cactusP = spots("#5fae4f", "#e8f5c8", { size: 0.045, amount: 0.3, seed: 2 });
  const cx = -1.02;
  const cz = 0.2;
  tube(
    [
      [cx, G - 0.02, cz],
      [cx, G + 0.15, cz],
      [cx, G + 0.32, cz],
    ],
    [0.05, 0.047, 0.04],
    cactusP,
    { caps: "round" },
  );
  tube(
    [
      [cx, G + 0.14, cz],
      [cx + 0.1, G + 0.15, cz],
      [cx + 0.14, G + 0.28, cz],
    ],
    0.03,
    cactusP,
  );
  tube(
    [
      [cx, G + 0.19, cz],
      [cx - 0.09, G + 0.2, cz],
      [cx - 0.12, G + 0.3, cz],
    ],
    0.028,
    cactusP,
  );
  ell([cx, G + 0.37, cz], [0.025, 0.02, 0.025], "#f48fb1");

  const rock = (x: number, z: number, s: number, col: string, yaw: number) =>
    put(new THREE.DodecahedronGeometry(s, 0), col, [x, G + s * 0.3, z], { scale: [1, 0.65, 0.85], quat: Q(yaw) });
  rock(1.0, 0.45, 0.1, "#b99a78", 30);
  rock(1.08, 0.38, 0.06, "#a8865f", 80);
  rock(-0.55, 0.85, 0.09, "#b99a78", 10);
  rock(-0.15, 0.85, 0.06, "#a8865f", 55);
  rock(-1.0, -0.6, 0.1, "#a99a88", 120);

  // grass tufts
  const tufts: Array<[number, number]> = [
    [0.3, -0.35],
    [-0.28, -0.3],
    [0.62, 0.05],
    [-0.62, 0.0],
    [0.0, 0.62],
    [0.9, -0.2],
  ];
  tufts.forEach(([x, z], k) => {
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + k;
      b.spike([x + Math.cos(a) * 0.015, G - 0.005, z + Math.sin(a) * 0.015], [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5], 0.08 + R() * 0.05, 0.01, i % 2 ? "#6cbf4b" : "#4f9f3f", {
        bone: base,
        sides: 4,
      });
    }
  });

  // footprints from the standing camel toward the pond
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const px = 0.6 - 0.35 * t + (i % 2 ? 0.025 : -0.025);
    const pz = 0.4 - 0.22 * t + (i % 2 ? -0.02 : 0.02);
    ell([px, G - 0.0005, pz], [0.022, 0.004, 0.035], "#d4b07a", { quat: Q(-125) });
  }

  return b.root;
}
