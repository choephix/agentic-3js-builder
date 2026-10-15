import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { lerp, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { mix, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description:
    "A cel-shaded fire phoenix with wings spread: layered flame plumage, streaming tail, gold filigree collar, pyro gem and glowing ember flames.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const RED = "#c4162a";
const DEEP = "#7e0f2c";
const ORANGE = "#ff6a1a";
const AMBER = "#ff9d1f";
const GOLD = "#ffc83a";
const CREAM = "#fff1b0";
const GILD = "#e8a92a";
const TALON = "#5a3018";

const D = Math.PI / 180;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const P_GOLD = cel(GILD);
const P_TALON = cel(TALON);
const P_BEAK = cel("#ffb52e", "#d9791a");
const P_JAW = cel("#f2a21f", "#c96a18");
const P_LEG = cel("#ff9d1f", "#e0561a");
const P_RED = cel(RED);
const P_ORANGE = cel(ORANGE);
const BODY = cel(furEdge(ORANGE, GOLD, { level: -0.25, teeth: 0.25, period: 0.045, along: [0, 0, 1] }));
const NECK = cel(furEdge(ORANGE, CREAM, { level: -0.1, teeth: 0.3, period: 0.04, along: [0, 0, 1] }));

const plume = (L: number, c0: string, c1: string, c2: string) =>
  cel(
    paint((_p, _n, s) => {
      const t = Math.min(Math.max(s[0] / L, 0), 1);
      if (Math.abs(s[1]) < 0.004 && t > 0.08 && t < 0.92) return CREAM;
      return t < 0.5 ? mix(c0, c1, t * 2) : mix(c1, c2, (t - 0.5) * 2);
    }),
  );

const STREAMER = cel(
  paint((_p, _n, s) => {
    const t = s[0];
    if (t < 0.78) return mix(RED, ORANGE, t / 0.78);
    if (t < 0.83) return CREAM;
    if (t < 0.92) return DEEP;
    return GOLD;
  }),
);
const CREST = cel(paint((_p, _n, s) => mix(RED, GOLD, s[0])));

const FLAME = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset="0.6" stop-color="#ff9d1a"/><stop offset="1" stop-color="#ffd24a"/></linearGradient></defs>
<path d="M16 2 C20 16 30 26 29 42 C28 56 20 62 16 62 C12 62 4 56 3 42 C2 30 10 24 12 14 C13 22 15 20 16 2Z" fill="url(#g)"/>
<path d="M16 24 C20 34 25 40 24 50 C23 58 19 60 16 60 C13 60 9 58 8 50 C7 42 13 38 16 24Z" fill="#ffe27a"/>
<path d="M16 40 C19 46 20 52 18 57 C17 59 15 59 14 57 C12 52 13 46 16 40Z" fill="#fff7d6"/></svg>`,
  { size: 128 },
);

const FEATHER_A = svg(
  `<svg viewBox="0 0 32 48"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c4162a"/><stop offset="0.55" stop-color="#ff6a1a"/><stop offset="1" stop-color="#ffc83a"/></linearGradient></defs>
<path d="M16 47 C3 34 1 14 16 1 C31 14 29 34 16 47Z" fill="url(#g)" stroke="#8a0f2a" stroke-width="2"/><path d="M16 44 L16 8" stroke="#fff1b0" stroke-width="2"/></svg>`,
  { size: 128 },
);
const FEATHER_B = svg(
  `<svg viewBox="0 0 32 48"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6a1a"/><stop offset="0.6" stop-color="#ffc83a"/><stop offset="1" stop-color="#fff1b0"/></linearGradient></defs>
<path d="M16 47 C3 34 1 14 16 1 C31 14 29 34 16 47Z" fill="url(#g)" stroke="#c4561a" stroke-width="2"/><path d="M16 44 L16 8" stroke="#ffffff" stroke-width="2"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const r = rng(11);

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const HIPS = v(0, 0.85, -0.3);
  const hips = b.joint("hips", { at: HIPS });
  const spine = b.chain("spine", catmull([HIPS, v(0, 0.92, 0.0), v(0, 1.02, 0.32)]), { parent: hips, role: "spine" });
  const neck = b.chain("neck", catmull([v(0, 1.02, 0.32), v(0, 1.2, 0.42), v(0, 1.38, 0.46), v(0, 1.5, 0.56)]), {
    parent: spine,
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: neck.at(1).at, dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.04 }),
    aim: head.local({ forward: 0.2, up: -0.045 }),
    role: "jaw",
  });
  const tail = b.chain("tail", catmull([HIPS, v(0, 0.8, -0.65), v(0, 0.72, -1.0)]), { parent: hips, role: "tail" });

  // ---- body -----------------------------------------------------------------------------------------------------
  const body = b.sweep(
    spine,
    (t) => {
      const e = Math.sin(Math.PI * (0.12 + 0.7 * t));
      return [0.1 + 0.14 * e, 0.11 + 0.15 * e];
    },
    { color: BODY },
  );
  b.sweep(neck, [0.13, 0.085, 0.07, 0.06], { color: NECK });
  b.sweep(tail, [0.1, 0.08, 0.05], { color: BODY });

  // body feather cards
  const skin = b.surface(body);
  const hits = skin.scatter(150, { rng: rng(21), minDist: 0.07 });
  b.cards(hits, [FEATHER_A, FEATHER_B], {
    size: [0.09, 0.14],
    lean: 60,
    bend: 20,
    vary: 0.25,
    spin: 15,
    rng: rng(22),
  });

  // chest pendant
  const chest = skin.ray([0, 1.0, 1.2], [0, -0.1, -1]);
  if (chest) {
    b.stick(new THREE.CylinderGeometry(0.052, 0.058, 0.014, 10), GILD, chest, { embed: 0.3 });
    glow(b.stick(new THREE.OctahedronGeometry(0.036, 0), "#ff7a1a", chest, { embed: 0.0 }), 1.3);
  }

  // ---- head -----------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), cel(ORANGE), {
    bone: head,
    at: head.local({ forward: 0.06, up: 0.01 }),
    scale: [0.085, 0.08, 0.1],
  });
  const eyeTex = animeEye({ iris: "#ff8a1c", blush: false, brow: false });
  const hskin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = hskin.around(skull.at).at(s * 52, 8)!;
    b.decal(hskin, eyeTex, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }
  b.sweep(
    bezier(
      head.local({ forward: 0.1, up: -0.005 }),
      head.local({ forward: 0.2, up: 0.012 }),
      head.local({ forward: 0.27, up: -0.05 }),
    ),
    (t) => [0.05 * (1 - t * 0.9), 0.042 * (1 - t * 0.9)],
    { bone: head, color: P_BEAK, caps: { start: "flat", end: "point" }, sides: 6 },
  );
  b.sweep(
    bezier(
      head.local({ forward: 0.1, up: -0.04 }),
      head.local({ forward: 0.18, up: -0.045 }),
      head.local({ forward: 0.24, up: -0.055 }),
    ),
    (t) => [0.04 * (1 - 0.85 * t), 0.028 * (1 - 0.85 * t)],
    { bone: jaw, color: P_JAW, caps: { start: "flat", end: "point" }, sides: 6 },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), "#ff5a1a", {
      bone: head,
      at: head.local({ forward: 0.12, up: 0.075 }),
    }),
    1.4,
  );

  // crest plumes
  const flames: ReturnType<typeof frame>[] = [];
  for (const k of [-2, -1, 0, 1, 2]) {
    const a = Math.abs(k);
    const base = head.local({ up: 0.08, right: k * 0.03 });
    const ctrl = head.local({ forward: -0.1, up: 0.2, right: k * 0.04 });
    const tip = head.local({ forward: -0.32 + a * 0.07, up: 0.12 + (2 - a) * 0.07, right: k * 0.08 });
    b.sweep(bezier(base, ctrl, tip), (t) => [0.012 + 0.03 * Math.sin(Math.PI * Math.pow(t, 0.7)), 0.008], {
      bone: head,
      color: CREST,
      caps: "point",
      sides: 6,
    });
    flames.push(frame(tip.toArray(), [0, 1, 0]));
  }

  // gold collar
  const np = neck.at(0.45);
  b.part(new THREE.TorusGeometry(0.095, 0.018, 6, 14), P_GOLD, { at: np.at, dir: np.tangent, axis: "z" });

  // ---- wings ----------------------------------------------------------------------------------------------------
  const outline = (L: number, W: number): OutlinePoint[] => [
    [0, -W * 0.25],
    [L * 0.25, -W * 0.9],
    [L * 0.65, -W * 0.8],
    [L * 0.93, -W * 0.3],
    [L, 0, "sharp"],
    [L * 0.93, W * 0.3],
    [L * 0.65, W * 0.8],
    [L * 0.25, W * 0.9],
    [0, W * 0.25],
  ];
  const feather = (base: THREE.Vector3, d: THREE.Vector3, L: number, W: number, pal: Paint, bone: Joint) => {
    const yv = new THREE.Vector3(0, 1, 0).cross(d).normalize();
    b.extrude(outline(L, W), {
      at: base,
      x: d,
      y: yv,
      thickness: 0.012,
      smoothing: 1,
      color: pal,
      bone,
    });
    return base.clone().addScaledVector(d, L);
  };
  const layered = (
    base: THREE.Vector3,
    d: THREE.Vector3,
    L: number,
    W: number,
    pal: Paint,
    c: [string, string, string][],
    bone: Joint,
    lift: number,
  ) => {
    const p = base.clone();
    p.y += lift;
    const tip = feather(p, d, L, W, pal, bone);
    const q = p.clone().addScaledVector(d, 0.05);
    q.y += 0.014;
    feather(q, d, L * 0.72, W * 0.9, plume(L * 0.72, ...c[0]), bone);
    const w = p.clone().addScaledVector(d, 0.08);
    w.y += 0.028;
    feather(w, d, L * 0.42, W * 0.8, plume(L * 0.42, ...c[1]), bone);
    return tip;
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const SH = v(s * 0.2, 1.0, 0.12);
    const EL = v(s * 0.75, 1.22, -0.02);
    const WR = v(s * 1.25, 1.3, -0.1);
    const HD = v(s * 1.5, 1.27, -0.08);
    const arm = b.chain(`wing${side}`, polyline([SH, EL, WR, HD]), {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    const jt = arm.joints;
    b.sweep(arm, [0.08, 0.07, 0.055, 0.03], { color: P_RED });
    b.part(new THREE.TorusGeometry(0.068, 0.013, 6, 12), P_GOLD, {
      at: lerp(EL, WR, 0.5),
      dir: WR.clone().sub(EL),
      axis: "z",
    });
    b.part(new THREE.TorusGeometry(0.058, 0.013, 6, 12), P_GOLD, {
      at: lerp(WR, HD, 0.3),
      dir: HD.clone().sub(WR),
      axis: "z",
    });

    // primaries
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const a = (80 - 72 * u) * D;
      const d = v(s * Math.cos(a), 0.04 * u - 0.02, -Math.sin(a)).normalize();
      const L = 0.65 + 0.45 * u;
      const tip = layered(
        lerp(WR, HD, u),
        d,
        L,
        0.075,
        plume(L, RED, AMBER, GOLD),
        [
          [RED, ORANGE, AMBER],
          [DEEP, RED, ORANGE],
        ],
        jt[2],
        i * 0.004,
      );
      flames.push(frame(tip.toArray(), [0, 1, 0]));
    }
    // secondaries
    for (let j = 0; j < 8; j++) {
      const u = j / 7;
      const a = (82 + 14 * u) * D;
      const d = v(s * Math.cos(a), -0.03, -Math.sin(a)).normalize();
      const L = 0.72 - 0.1 * u;
      layered(
        lerp(WR, EL, u),
        d,
        L,
        0.085,
        plume(L, RED, ORANGE, GOLD),
        [
          [RED, ORANGE, AMBER],
          [DEEP, RED, ORANGE],
        ],
        jt[1],
        j * 0.004 + 0.036,
      );
    }
    // tertials
    for (let k = 0; k < 5; k++) {
      const u = k / 4;
      const a = (100 + 12 * u) * D;
      const d = v(s * Math.cos(a), -0.04, -Math.sin(a)).normalize();
      const L = 0.6 - 0.15 * u;
      layered(
        lerp(EL, SH, u),
        d,
        L,
        0.09,
        plume(L, DEEP, RED, ORANGE),
        [
          [DEEP, RED, ORANGE],
          [DEEP, DEEP, RED],
        ],
        jt[0],
        k * 0.004 + 0.07,
      );
    }
  }

  // ---- legs -----------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb(v(s * 0.15, 0.8, -0.15), v(s * 0.17, 0.11, 0.0), [0.4, 0.38], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.075, 0.06, 0.04], { color: P_LEG });
    const toeBone = leg.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), P_ORANGE, {
      bone: hips,
      at: v(s * 0.16, 0.76, -0.12),
      scale: [0.13, 0.2, 0.15],
    });
    b.part(new THREE.TorusGeometry(0.052, 0.012, 6, 10), P_GOLD, {
      at: lerp(pts[1], pts[2], 0.75),
      dir: pts[2].clone().sub(pts[1]),
      axis: "z",
    });
    const ax = pts[2].x;
    const az = pts[2].z;
    for (const th of [-32, 0, 32, 180]) {
      const rr = th * D;
      const ux = Math.sin(rr);
      const uz = Math.cos(rr);
      const len = th === 180 ? 0.2 : 0.27;
      const p0 = pts[2].clone();
      const p1 = v(ax + ux * len * 0.4, 0.05, az + uz * len * 0.4);
      const p2 = v(ax + ux * len, 0.032, az + uz * len);
      b.sweep(polyline([p0, p1, p2]), [0.034, 0.026, 0.016], {
        bone: toeBone,
        color: P_LEG,
        caps: { start: "round", end: "point" },
        sides: 6,
      });
      b.spike(p2, [ux, -0.5, uz], 0.08, 0.02, P_TALON, { bone: toeBone, sides: 6 });
    }
  }

  // ---- tail streamers -------------------------------------------------------------------------------------------
  const tailBone = tail.joints[1];
  const base = [0, 0.78, -0.62];
  for (const i of [-3, -2, -1, 0, 1, 2, 3]) {
    const a = Math.abs(i);
    const x = i * 0.3;
    const tip = [x, 0.25 + a * 0.1, -2.3 + a * 0.18];
    const w = 0.07 + 0.02 * (3 - a);
    b.sweep(
      bezier(base, [i * 0.05, 0.7, -1.1], [x * 0.7, 0.35 + a * 0.05, tip[2] + 0.4], tip),
      (t) => [0.02 + w * Math.sin(Math.PI * Math.pow(t, 0.7)), 0.008],
      { bone: tailBone, color: STREAMER, caps: "point", sides: 6 },
    );
    flames.push(frame(tip, [0, 1, 0]));
  }
  for (const i of [-1.5, -0.5, 0.5, 1.5]) {
    const tip = [i * 0.25, 0.6, -1.7];
    b.sweep(
      bezier(base, [i * 0.05, 0.74, -1.0], [i * 0.17, 0.62, -1.45], tip),
      (t) => [0.02 + 0.07 * Math.sin(Math.PI * Math.pow(t, 0.7)), 0.008],
      { bone: tailBone, color: STREAMER, caps: "point", sides: 6 },
    );
  }

  // ---- flames ---------------------------------------------------------------------------------------------------
  glow(b.cards(flames, FLAME, { size: [0.16, 0.34], lean: 0, cross: true, vary: 0.3, rng: rng(5) }), 1);

  // ---- embers ---------------------------------------------------------------------------------------------------
  const embers: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 30; i++) {
    const g = new THREE.OctahedronGeometry(1, 0);
    const sc = 0.02 + 0.025 * r();
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        v((r() - 0.5) * 4.6, 0.35 + r() * 1.7, -1.0 + r() * 1.8),
        q,
        new THREE.Vector3(sc, sc * 1.5, sc),
      ),
    );
    embers.push(g);
  }
  glow(b.part(mergeGeometries(embers), "#ffb347", { bone: hips, at: [0, 0, 0], name: "embers" }), 1.2);

  return b.root;
}
