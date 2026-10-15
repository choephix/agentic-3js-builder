// Lava golem: a towering basalt colossus bound with gold, molten seams glowing through cracked plates, Genshin-style
// cel shading (kits/toon) with pyro glow (kits/glow).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { lerp, rng } from "../../../../src/math";
import { cells, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Lava Golem",
  description:
    "A three-metre basalt golem of layered plates and hex columns, molten seams blazing through the cracks, gold-banded like a sealed shrine guardian, pyro flames crowning its horned head.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

/** Basalt with glowing lava seams: cell borders in world space glow, hotter toward the ground. */
function molten(base: Paint, size: number, seed: number, w: number): Paint {
  return paint((p) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    const ww = w * (1.35 - 0.3 * p.y);
    if (e < ww * 0.28) return "#fff0a0";
    if (e < ww * 0.55) return "#ffc22e";
    if (e < ww) return "#ff7a1c";
    if (e < ww * 1.4) return "#b9250f";
    return base;
  });
}

const FLAME = `<svg viewBox="0 0 64 96"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4a12"/><stop offset="0.55" stop-color="#ff9a1f"/><stop offset="1" stop-color="#ffe066"/></linearGradient></defs>
<path d="M32 2 C34 24 58 40 56 64 C54 82 44 94 32 94 C20 94 8 82 8 64 C8 46 24 40 26 20 C28 28 30 22 32 2 Z" fill="url(#g)"/>
<path d="M33 42 C37 54 46 62 44 76 C42 88 36 92 32 92 C26 92 20 88 20 76 C20 64 31 58 33 42 Z" fill="#fff0a0"/></svg>`;

const TASSEL = `<svg viewBox="0 0 24 64"><rect x="10" y="0" width="4" height="12" fill="#f0b73c"/><circle cx="12" cy="14" r="6" fill="#f0b73c"/>
<path d="M4 18 L20 18 L22 62 L2 62 Z" fill="#d6321f"/><path d="M8 18 L8 62 M12 18 L12 62 M16 18 L16 62" stroke="#8f1a10" stroke-width="1.4"/>
<rect x="3" y="22" width="18" height="3" fill="#f0b73c"/></svg>`;

const FILIGREE = `<svg viewBox="0 0 64 64"><g fill="none" stroke="#f6cf5a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
<circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="22" stroke-width="1.8"/>
<g id="petal"><path d="M32 6 C39 16 39 24 32 30 C25 24 25 16 32 6 Z"/></g>
<g transform="rotate(90 32 32)"><path d="M32 6 C39 16 39 24 32 30 C25 24 25 16 32 6 Z"/></g>
<g transform="rotate(180 32 32)"><path d="M32 6 C39 16 39 24 32 30 C25 24 25 16 32 6 Z"/></g>
<g transform="rotate(270 32 32)"><path d="M32 6 C39 16 39 24 32 30 C25 24 25 16 32 6 Z"/></g>
<path d="M12 12 Q18 18 22 14 M52 12 Q46 18 42 14 M12 52 Q18 46 22 50 M52 52 Q46 46 42 50"/></g>
<g fill="#f6cf5a"><circle cx="32" cy="3" r="2.4"/><circle cx="32" cy="61" r="2.4"/><circle cx="3" cy="32" r="2.4"/><circle cx="61" cy="32" r="2.4"/></g></svg>`;

const eyeSvg = (mirror: boolean) => {
  const inner = `<path d="M2 8 L60 2 C62 14 50 28 30 28 C14 28 4 20 2 8 Z" fill="#ff7a1a"/>
<path d="M8 11 L54 6 C54 15 46 24 30 24 C18 24 10 18 8 11 Z" fill="#ffd34a"/>
<ellipse cx="32" cy="15" rx="3.2" ry="8.5" fill="${INK}"/><circle cx="24" cy="12" r="2.6" fill="#fff6c8"/>`;
  return svg(
    `<svg viewBox="0 0 64 32">${mirror ? `<g transform="translate(64 0) scale(-1 1)">${inner}</g>` : inner}</svg>`,
    { size: 128 },
  );
};

export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const R = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const STONE = molten(cel(mottle("#6d6179", "#5a4f68", { size: 0.3, seed: 3 })), 0.42, 3, 0.13);
  const STONE2 = molten(cel(mottle("#4b4259", "#3f364f", { size: 0.22, seed: 9 })), 0.5, 8, 0.08);
  const GOLD = cel("#f7cd55", "#c98a2b");
  const OBS = cel("#2a2233", INK);
  const TOOTH = "#efe0bd";
  const MID = "#ff7a1f";
  const HOT = "#ffe27a";

  // ---------------------------------------------------------------- helpers
  const box = (
    size: [number, number, number],
    at: [number, number, number],
    bone: Joint,
    color: Fill,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      flat: true,
      ...(rotation ? { rotation } : {}),
    });
  const column = (
    tipR: number,
    baseR: number,
    len: number,
    at: THREE.Vector3 | number[],
    dir: THREE.Vector3 | number[],
    bone: Joint,
    color: Fill,
    sides = 6,
  ) => b.part(new THREE.CylinderGeometry(tipR, baseR, len, sides), color, { at, dir, bone, flat: true });
  const blob = (
    r: number,
    scale: [number, number, number],
    at: [number, number, number],
    bone: Joint,
    color: Fill,
    w = 8,
    h = 5,
  ) => b.part(new THREE.SphereGeometry(r, w, h), color, { at, bone, scale, flat: true });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.2, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, 0],
      [0, 1.62, 0.03],
      [0, 2.04, 0.08],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spineLow = spine.joints[0];
  const spineUp = spine.joints[1];
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    [
      [0, 2.04, 0.08],
      [0, 2.3, 0.14],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 2.3, 0.14], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.22, 0.02], aim: [0, 2.2, 0.3], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.sweep(
    spine,
    (t) => [0.34 + 0.3 * Math.sin((t * Math.PI) / 2), 0.28 + 0.1 * t],
    { color: STONE, sides: 8, smooth: false },
  );
  const skin = b.surface(torso);
  const zAt = (x: number, y: number, back: boolean, def: number) => {
    const h = back ? skin.ray([x, y, -2], [0, 0, 1]) : skin.ray([x, y, 2], [0, 0, -1]);
    return h ? h.at.z : def;
  };
  b.sweep(neck, 0.19, { color: STONE2, sides: 6, smooth: false });

  // pelvis, tassets, loin plates
  box([0.86, 0.34, 0.56], [0, 1.18, 0], hips, STONE2);
  box([0.38, 0.42, 0.08], [0, 0.97, 0.3], hips, STONE, [-8, 0, 0]);
  box([0.4, 0.04, 0.1], [0, 1.17, 0.31], hips, GOLD, [-8, 0, 0]);
  for (const s of [1, -1]) {
    box([0.16, 0.4, 0.5], [s * 0.47, 1.08, 0.04], hips, STONE, [0, 0, -s * 12]);
    box([0.17, 0.04, 0.52], [s * 0.46, 1.27, 0.04], hips, GOLD, [0, 0, -s * 12]);
    box([0.14, 0.34, 0.06], [s * 0.2, 0.98, 0.29], hips, STONE2, [-8, s * 8, 0]);
  }

  // belt of gold plates with a gem buckle
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    if (i === 0) continue;
    const x = Math.sin(a) * 0.47;
    const z = Math.cos(a) * 0.38;
    box([0.2, 0.13, 0.05], [x, 1.3, z], spineLow, GOLD, [0, (a * 180) / Math.PI, 0]);
    b.part(new THREE.SphereGeometry(0.018, 5, 4), "#fff1b0", {
      at: [x * 1.06, 1.3, z * 1.06],
      bone: spineLow,
    });
  }
  box([0.26, 0.2, 0.07], [0, 1.3, 0.4], spineLow, GOLD);
  glow(b.part(new THREE.OctahedronGeometry(0.06, 0), "#ff5a2a", { at: [0, 1.3, 0.45], bone: spineLow, flat: true }));
  const tasselTex = svg(TASSEL, { size: 128 });
  const tasselFrames = [-62, -30, 30, 62].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return frame([Math.sin(a) * 0.49, 1.24, Math.cos(a) * 0.4], [0, 1, 0]);
  });
  b.cards(tasselFrames, tasselTex, { size: [0.08, 0.3], lean: 180, flow: [0, 0, 1], bone: spineLow, sink: 0 });

  // abdomen plates and the vertical vein between them
  for (const [y, h] of [
    [1.46, 0.13],
    [1.62, 0.13],
  ]) {
    for (const s of [1, -1])
      box([0.22, h, 0.1], [s * 0.15, y, zAt(s * 0.15, y, false, 0.34) + 0.01], spineLow, STONE2, [0, s * 6, 0]);
  }
  const veinPts = [1.66, 1.55, 1.45, 1.36].map((y) => [0, y, zAt(0, y, false, 0.34) + 0.01]);
  glow(b.sweep(catmull(veinPts), 0.02, { color: HOT, sides: 4, bone: spineLow }));

  // pectoral plates with gold trim
  for (const s of [1, -1]) {
    const z = zAt(s * 0.4, 1.84, false, 0.3);
    box([0.42, 0.36, 0.15], [s * 0.4, 1.84, z + 0.01], spineUp, STONE, [-10, s * 16, -s * 6]);
    box([0.44, 0.035, 0.16], [s * 0.4, 1.655, z + 0.0], spineUp, GOLD, [-10, s * 16, -s * 6]);
    for (let k = 0; k < 3; k++)
      b.part(new THREE.SphereGeometry(0.02, 5, 4), "#fff1b0", {
        at: [s * (0.28 + 0.12 * k), 1.655, z + 0.09],
        bone: spineUp,
      });
  }

  // chest core: filigree, core gem, gold ring and points
  const zc = zAt(0, 1.74, false, 0.34);
  b.decal(torso, svg(FILIGREE, { size: 192 }), { at: [0, 1.74, zc], dir: [0, 0, 1], size: [0.36, 0.36] });
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), MID, { at: [0, 1.74, zc + 0.02], bone: spineUp, flat: true }), 1.2);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 5), HOT, { at: [0, 1.74, zc + 0.08], bone: spineUp, flat: true }));
  b.part(new THREE.TorusGeometry(0.15, 0.022, 5, 14), GOLD, { at: [0, 1.74, zc + 0.05], bone: spineUp, flat: true });
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.ConeGeometry(0.025, 0.08, 4), GOLD, {
      at: [Math.cos(a) * 0.19, 1.74 + Math.sin(a) * 0.19, zc + 0.05],
      dir: [Math.cos(a), Math.sin(a), 0],
      bone: spineUp,
      flat: true,
    });
  }

  // back: spikes, basalt columns, flames
  [1.45, 1.62, 1.8, 1.95].forEach((y, i) => {
    b.spike([0, y, zAt(0, y, true, -0.3) + 0.03], [0, 0.45, -1], 0.24 + 0.03 * i, 0.06, OBS, {
      bone: spineUp,
      sides: 5,
    });
  });
  for (let k = 0; k < 5; k++) {
    const dir = V(0, 1, -0.5).normalize();
    const len = 0.5 + 0.1 * (k % 3);
    const base = V(-0.36 + 0.18 * k, 2.1 + 0.05 * (k % 2), -0.27);
    column(0.07, 0.085, len, base.clone().addScaledVector(dir, len / 2), dir, chest, k % 2 ? STONE2 : STONE);
    glow(b.part(new THREE.CircleGeometry(0.045, 6), "#ff8a20", {
      at: base.clone().addScaledVector(dir, len + 0.004),
      dir,
      axis: "z",
      bone: chest,
    }));
  }
  const flameTex = svg(FLAME, { size: 128 });
  const backHits = skin.scatter(14, {
    rng: R,
    minDist: 0.17,
    filter: (h) => h.n.z < -0.3 && h.at.y > 1.45,
  });
  glow(b.cards(backHits, flameTex, { size: [0.2, 0.42], lean: 20, flow: [0, 1, -0.2], cross: true, vary: 0.3, rng: R }));

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.8, 1.98, 0.02);
    const el = V(s * 1.04, 1.3, 0.1);
    const wr = V(s * 1.12, 0.72, 0.2);
    const arm = b.chain(`arm${S}`, [sh, el, wr], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const [upper, fore, hand] = arm.joints;
    glow(b.sweep(arm, [0.15, 0.13, 0.14, 0.12], { color: MID, sides: 6 }));

    // upper arm block, gold rim, elbow spike
    b.frustumBox(lerp(sh, el, 0.14), lerp(sh, el, 0.84), [0.46, 0.44], [0.4, 0.38], { color: STONE, bone: upper });
    column(0.25, 0.25, 0.05, lerp(sh, el, 0.86), V(0, 1, 0).add(el.clone().sub(sh).normalize()).multiplyScalar(0.5), upper, GOLD, 8);
    b.spike(el.clone().add(V(s * 0.1, 0.02, -0.1)), [s * 0.6, 0.2, -0.8], 0.34, 0.09, OBS, { bone: fore, sides: 5 });

    // forearm: bundle of fused basalt columns
    const axis = wr.clone().sub(el).normalize();
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      const len = 0.4 + 0.08 * (k % 3);
      const c = lerp(el, wr, 0.55 + 0.04 * (k % 3)).add(V(Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15));
      column(0.075, 0.088, len, c, axis, fore, k % 2 ? STONE2 : STONE);
    }
    column(0.25, 0.27, 0.1, lerp(el, wr, 0.97), axis, fore, GOLD, 8);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + 0.3;
      b.part(new THREE.SphereGeometry(0.02, 5, 4), "#fff1b0", {
        at: lerp(el, wr, 0.97).add(V(Math.cos(a) * 0.27, 0, Math.sin(a) * 0.27)),
        bone: fore,
      });
    }

    // fist, knuckle studs, fingers, thumb
    const fx = s * 1.13;
    box([0.38, 0.34, 0.4], [fx, 0.53, 0.22], hand, STONE, [0, s * 6, 0]);
    box([0.3, 0.1, 0.3], [fx, 0.7, 0.2], hand, STONE2);
    for (let i = 0; i < 4; i++)
      column(0.03, 0.04, 0.07, [fx + (i - 1.5) * 0.085, 0.66, 0.42], [0, 0.4, 1], hand, GOLD, 5);
    for (let i = 0; i < 3; i++) {
      const x = fx + (i - 1) * 0.11;
      const fc = b.chain(`finger${S}${i}`, [V(x, 0.42, 0.36), V(x, 0.28, 0.45), V(x, 0.14, 0.41)], {
        parent: hand,
        names: [`finger${S}${i}a`, `finger${S}${i}b`, `finger${S}${i}c`],
        role: "digit",
      });
      b.sweep(fc, [0.06, 0.05, 0.04], { color: STONE2, sides: 5, smooth: false });
      glow(b.part(new THREE.SphereGeometry(0.032, 5, 4), HOT, {
        at: V(x, 0.14, 0.41),
        bone: fc.joints[fc.joints.length - 1],
        flat: true,
      }));
    }
    const th = b.chain(
      `thumb${S}`,
      [V(fx - s * 0.15, 0.5, 0.3), V(fx - s * 0.24, 0.4, 0.42), V(fx - s * 0.26, 0.3, 0.52)],
      { parent: hand, names: [`thumb${S}a`, `thumb${S}b`, `thumb${S}c`], role: "digit" },
    );
    b.sweep(th, [0.062, 0.05, 0.04], { color: STONE2, sides: 5, smooth: false });
    glow(b.part(new THREE.SphereGeometry(0.032, 5, 4), HOT, {
      at: V(fx - s * 0.26, 0.3, 0.52),
      bone: th.joints[th.joints.length - 1],
      flat: true,
    }));

    // pauldron: dome, layered plate, gold rim, rivets, spike, columns, tassel
    blob(1, [0.42, 0.28, 0.38], [s * 0.86, 2.1, 0.0], chest, STONE);
    box([0.56, 0.08, 0.5], [s * 0.95, 1.98, 0], chest, STONE2, [0, 0, -s * 18]);
    b.part(new THREE.TorusGeometry(0.4, 0.028, 5, 14), GOLD, {
      at: [s * 0.88, 2.04, 0],
      rotation: [90, 0, -s * 14],
      bone: chest,
      flat: true,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.02, 5, 4), "#fff1b0", {
        at: [s * 0.88 + Math.cos(a) * 0.4, 2.04 + s * Math.cos(a) * 0.4 * -0.24, Math.sin(a) * 0.4],
        bone: chest,
      });
    }
    b.spike([s * 1.0, 2.2, 0], [s * 0.7, 0.8, 0], 0.36, 0.09, OBS, { bone: chest, sides: 5 });
    for (let k = 0; k < 4; k++) {
      const dir = V(s * 0.1, 1, 0.05 * k - 0.07).normalize();
      const len = 0.28 + 0.06 * (k % 2);
      const base = V(s * (0.66 + 0.07 * k), 2.3 + 0.03 * k, -0.08 + 0.05 * k);
      column(0.05, 0.06, len, base.clone().addScaledVector(dir, len / 2), dir, chest, k % 2 ? STONE : STONE2);
    }
    b.cards([frame([s * 0.88, 1.96, 0.33], [0, 1, 0])], tasselTex, {
      size: [0.08, 0.3],
      lean: 180,
      flow: [0, 0, 1],
      bone: chest,
      sink: 0,
    });
    glow(b.cards(
      [0, 1, 2].map((k) => frame([s * (0.78 + 0.09 * k), 2.35 + 0.03 * k, 0.0], [0, 1, 0])),
      flameTex,
      { size: [0.15, 0.32], lean: 0, flow: [s, 0, 0], cross: true, bone: chest },
    ));
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hp = V(s * 0.3, 1.15, 0);
    const kn = V(s * 0.36, 0.64, 0.12);
    const an = V(s * 0.36, 0.22, 0.02);
    const leg = b.chain(`leg${S}`, [hp, kn, an], {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const [thigh, shin, ankle] = leg.joints;
    glow(b.sweep(leg, [0.15, 0.12, 0.11], { color: MID, sides: 6 }));
    b.frustumBox(lerp(hp, kn, 0.08), lerp(hp, kn, 0.78), [0.5, 0.46], [0.46, 0.42], { color: STONE, bone: thigh });
    column(0.27, 0.27, 0.05, lerp(hp, kn, 0.8), kn.clone().sub(hp), thigh, GOLD, 8);
    b.frustumBox(lerp(kn, an, 0.2), lerp(kn, an, 1.0), [0.42, 0.4], [0.5, 0.46], { color: STONE2, bone: shin });
    box([0.3, 0.38, 0.06], [s * 0.36, 0.42, 0.28], shin, STONE, [-6, 0, 0]);
    box([0.32, 0.04, 0.07], [s * 0.36, 0.62, 0.285], shin, GOLD, [-6, 0, 0]);
    b.part(new THREE.DodecahedronGeometry(0.17, 0), STONE2, { at: [s * 0.36, 0.67, 0.24], bone: shin, flat: true });
    b.spike([s * 0.36, 0.7, 0.32], [0, 0.3, 1], 0.2, 0.06, OBS, { bone: shin, sides: 5 });
    column(0.26, 0.28, 0.06, lerp(kn, an, 0.93), an.clone().sub(kn), shin, GOLD, 8);
    box([0.46, 0.2, 0.62], [s * 0.36, 0.1, 0.14], ankle, STONE);
    for (let i = -1; i <= 1; i++) {
      box([0.14, 0.14, 0.17], [s * 0.36 + i * 0.15, 0.07, 0.49], ankle, i === 0 ? STONE : STONE2, [0, i * 8, 0]);
      glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), HOT, {
        at: [s * 0.36 + i * 0.15, 0.1, 0.575],
        bone: ankle,
        flat: true,
      }));
    }
  }

  // ---------------------------------------------------------------- head
  box([0.44, 0.3, 0.4], [0, 2.38, 0.14], head, STONE);
  box([0.36, 0.07, 0.34], [0, 2.54, 0.1], head, STONE2, [-6, 0, 0]);
  box([0.5, 0.08, 0.14], [0, 2.48, 0.32], head, OBS, [-12, 0, 0]);
  box([0.1, 0.06, 0.1], [0, 2.32, 0.36], head, STONE2);
  for (const s of [1, -1]) {
    box([0.1, 0.16, 0.22], [s * 0.25, 2.33, 0.12], head, STONE2, [0, s * 8, 0]);
    column(0.075, 0.075, 0.05, [s * 0.285, 2.4, 0.1], [s, 0, 0], head, GOLD, 8);
  }
  const eyeL = eyeSvg(false);
  const eyeR = eyeSvg(true);
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.15, 0.075), "#ffffff", {
      at: [s * 0.1, 2.4, 0.347],
      bone: head,
      texture: s > 0 ? eyeL : eyeR,
    }));

  // mouth: glowing gap between upper head and lower jaw
  box([0.38, 0.1, 0.34], [0, 2.15, 0.17], jaw, STONE2);
  box([0.4, 0.03, 0.36], [0, 2.105, 0.17], jaw, GOLD);
  glow(b.part(new THREE.BoxGeometry(0.34, 0.04, 0.3), "#ff9a24", { at: [0, 2.215, 0.16], bone: head }));
  for (let i = 0; i < 5; i++)
    b.part(new THREE.ConeGeometry(0.026, 0.07, 4), TOOTH, {
      at: [-0.16 + 0.08 * i, 2.205, 0.325],
      rotation: [180, 0, 0],
      bone: head,
      flat: true,
    });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.ConeGeometry(0.024, 0.06, 4), TOOTH, {
      at: [-0.12 + 0.08 * i, 2.23, 0.325],
      bone: jaw,
      flat: true,
    });
  for (const s of [1, -1]) {
    b.spike([s * 0.17, 2.17, 0.3], [s * 0.2, 1, 0.4], 0.22, 0.04, OBS, { bone: jaw, sides: 5 });
    // swept horns, gold-banded at the root
    b.sweep(
      catmull([
        [s * 0.17, 2.5, 0.05],
        [s * 0.34, 2.6, 0.0],
        [s * 0.42, 2.8, 0.05],
        [s * 0.34, 3.0, 0.14],
      ]),
      [0.075, 0.012],
      {
        color: OBS,
        bands: [
          [0.16, GOLD],
          [1, OBS],
        ],
        bone: head,
        sides: 6,
        caps: { start: "flat", end: "point" },
      },
    );
  }
  // flame crown
  glow(b.cards(
    [0, 1, 2, 3, 4, 5, 6].map((k) => {
      const a = (k / 7) * Math.PI * 2;
      return frame([Math.sin(a) * 0.13, 2.56, 0.1 + Math.cos(a) * 0.12], [0, 1, 0]);
    }),
    flameTex,
    { size: [0.14, 0.34], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.25, rng: R, bone: head },
  ));

  // floating pyro embers
  for (let i = 0; i < 9; i++) {
    const side = R() < 0.5 ? -1 : 1;
    const x = side * (1.25 + R() * 0.5);
    const y = 0.9 + R() * 1.9;
    const z = -0.3 + R() * 0.9;
    glow(b.part(new THREE.OctahedronGeometry(0.025 + R() * 0.03, 0), i % 3 ? "#ffb02e" : HOT, {
      at: [x, y, z],
      bone: chest,
      flat: true,
    }));
  }

  return b.root;
}
