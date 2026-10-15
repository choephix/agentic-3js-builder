import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { catmull, polyline } from "../../../../src/path";
import { cells, mottle, paint } from "../../../../src/paint";
import { rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A hulking golem of cel-shaded basalt column plates over a glowing molten core, gold ancient rings, glowing rune and slit eyes.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const LAVA = "#ff6a14";
const HOT = "#ffd23a";
const EMBER = "#ff3d0e";

// Basalt: two-tone cel purple-grey, with glowing crack lines where Worley cells meet.
const BASE = cel(mottle("#5d5470", "#473f5a", { size: 0.32, seed: 3 }), "#2f2940");
const ROCK = paint((p, n) => {
  const c = cells(p, 0.3, 5);
  const e = c.d2 - c.d1;
  if (c.id > 0.45 && e < 0.035) return HOT;
  if (c.id > 0.45 && e < 0.075) return LAVA;
  return BASE;
});
const DARK = cel(mottle("#3a3248", "#2a2338", { size: 0.25, seed: 9 }), "#1c1727");
const GOLD = cel("#f0c04a", "#b9771f");

const hex = (r: number, h: number) => new THREE.CylinderGeometry(r, r * 0.9, h, 6);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

const RUNE = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 6 L52 24 L32 58 L12 24 Z M32 6 L32 58 M12 24 L52 24" stroke="#ffcf4a" stroke-width="4" fill="none" stroke-linejoin="round"/><circle cx="32" cy="30" r="6" fill="#ff7a1a"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const rand = rng(11);

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 1.2, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, 0],
      [0, 1.58, 0.03],
      [0, 1.98, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.0, 0.06],
      [0, 2.22, 0.16],
    ]),
    { parent: chest, names: ["neck", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.3, 0.12], aim: [0, 2.2, 0.42], role: "jaw" });

  // ---- torso: molten core with basalt plates ----
  const core = b.loft(
    [
      { at: [0, 1.12, 0], w: 0.72, h: 0.5 },
      { at: [0, 1.6, 0.02], w: 0.88, h: 0.55 },
      { at: [0, 2.0, 0.04], w: 1.15, h: 0.62 },
    ],
    { bone: [hips, spine], color: LAVA, section: { ngon: 8 } },
  );
  glow(core, 1);

  // pelvis girdle and loincloth slabs
  b.part(box(1.0, 0.3, 0.72), ROCK, { bone: hips, at: [0, 1.08, 0], flat: true });
  b.part(box(1.06, 0.07, 0.78), GOLD, { bone: hips, at: [0, 1.25, 0] });
  b.part(box(0.36, 0.55, 0.07), DARK, { bone: hips, at: [0, 0.86, 0.38] });
  glow(b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", { bone: hips, at: [0, 0.88, 0.425], texture: RUNE }), 1.2);
  for (const s of [1, -1]) {
    b.part(box(0.22, 0.42, 0.06), ROCK, { bone: hips, at: [s * 0.28, 0.9, 0.36], rotation: [0, 0, s * 6], flat: true });
    b.part(box(0.22, 0.34, 0.06), ROCK, { bone: hips, at: [s * 0.3, 0.88, -0.36], flat: true });
  }
  b.part(box(0.5, 0.4, 0.06), ROCK, { bone: hips, at: [0, 0.9, -0.38], flat: true });

  // abdomen plates in rows, lava glowing between
  const belly = spine.joints[0];
  [1.38, 1.56, 1.74].forEach((y, i) => {
    for (const s of [1, -1]) {
      b.part(box(0.34 - i * 0.02, 0.13, 0.12), ROCK, {
        bone: belly,
        at: [s * 0.2, y, 0.27 + i * 0.01],
        rotation: [0, s * 8, 0],
        flat: true,
      });
      b.part(box(0.3, 0.14, 0.1), ROCK, { bone: belly, at: [s * 0.2, y, -0.27], flat: true });
    }
  });
  b.part(box(0.1, 0.5, 0.1), DARK, { bone: belly, at: [0, 1.57, 0.3] });

  // chest: two pec slabs around the glowing heart core
  for (const s of [1, -1]) {
    b.part(box(0.5, 0.42, 0.28), ROCK, {
      bone: chest,
      at: [s * 0.3, 1.9, 0.3],
      rotation: [-8, s * 14, 0],
      flat: true,
    });
    b.part(box(0.6, 0.55, 0.22), ROCK, { bone: chest, at: [s * 0.3, 1.85, -0.3], flat: true });
  }
  glow(b.part(new THREE.IcosahedronGeometry(0.17, 1), HOT, { bone: chest, at: [0, 1.86, 0.36] }), 1.6);
  b.part(new THREE.TorusGeometry(0.22, 0.035, 5, 8), GOLD, { bone: chest, at: [0, 1.86, 0.4] });
  b.ring(frame([0, 1.86, 0.4], [0, 0, 1]), { count: 8, radius: 0.25 }, (item) => {
    b.stick(box(0.07, 0.1, 0.07), DARK, item, { embed: 0.3 });
  });

  // collar and gorget
  b.part(hex(0.34, 0.12), ROCK, { bone: chest, at: [0, 2.08, 0.05], flat: true });
  b.part(new THREE.TorusGeometry(0.3, 0.03, 5, 12), GOLD, { bone: chest, at: [0, 2.15, 0.06], rotation: [90, 0, 0] });

  // dorsal basalt columns with glowing tips
  [
    [1.25, 0.26, 25],
    [1.5, 0.34, 30],
    [1.78, 0.42, 34],
    [2.04, 0.36, 38],
  ].forEach(([y, h, tilt], i) => {
    const pos: [number, number, number] = [(i % 2 ? 1 : -1) * 0.08, y, -0.34];
    const t = (tilt * Math.PI) / 180;
    b.part(hex(0.085, h), ROCK, { bone: chest, at: pos, rotation: [-tilt, 0, 0], flat: true });
    glow(
      b.part(new THREE.ConeGeometry(0.06, 0.12, 6), EMBER, {
        bone: chest,
        at: [pos[0], pos[1] + Math.cos(t) * (h / 2 + 0.05), pos[2] - Math.sin(t) * (h / 2 + 0.05)],
        rotation: [-tilt, 0, 0],
      }),
      1.3,
    );
  });

  // shards over the torso
  const hits = b.surface(core).scatter(26, { rng: rand, minDist: 0.16, filter: (h) => h.n.y > -0.3 && h.at.y > 1.3 });
  for (const hit of hits) b.stick(new THREE.ConeGeometry(0.045, 0.14, 5), DARK, hit, { embed: 0.3 });

  // ---- neck & head ----
  glow(b.sweep(neck, 0.1, { color: LAVA }), 1);
  const HEAD_C: [number, number, number] = [0, 2.4, 0.25];
  b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, { bone: head, at: HEAD_C, scale: [0.28, 0.22, 0.26], flat: true });
  b.part(new THREE.IcosahedronGeometry(1, 0), DARK, {
    bone: head,
    at: [0, 2.5, 0.14],
    scale: [0.24, 0.12, 0.22],
    rotation: [0, 30, 0],
    flat: true,
  });
  b.part(new THREE.IcosahedronGeometry(1, 0), ROCK, { bone: jaw, at: [0, 2.2, 0.28], scale: [0.23, 0.09, 0.2], flat: true });
  glow(b.part(box(0.28, 0.04, 0.2), HOT, { bone: head, at: [0, 2.27, 0.33] }), 1.3);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.07;
    b.part(new THREE.ConeGeometry(0.02, 0.07, 4), "#f2e2c4", { bone: jaw, at: [x, 2.27, 0.44 - Math.abs(i - 2) * 0.02] });
  }
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.05, 6, 4), HOT, { bone: head, at: [s * 0.115, 2.43, 0.485], scale: [1.7, 0.7, 0.8] }),
      1.6,
    );
    b.part(box(0.22, 0.05, 0.11), DARK, { bone: head, at: [s * 0.115, 2.49, 0.47], rotation: [0, 0, s * 22] });
    b.part(new THREE.TorusGeometry(0.045, 0.014, 4, 6), GOLD, { bone: head, at: [s * 0.4 * 0.7, 2.4, 0.2], rotation: [0, 90, 0] });
  }
  glow(b.part(new THREE.PlaneGeometry(0.09, 0.09), "#ffffff", { bone: head, at: [0, 2.545, 0.43], rotation: [-35, 0, 0], texture: RUNE }), 1.2);
  [
    [-0.12, 28],
    [0, 35],
    [0.12, 28],
  ].forEach(([x, tilt], i) => {
    const h = i === 1 ? 0.34 : 0.24;
    const t = (tilt * Math.PI) / 180;
    const pos: [number, number, number] = [x, 2.58, 0.08];
    b.part(hex(0.05, h), ROCK, { bone: head, at: pos, rotation: [-tilt, 0, 0], flat: true });
    glow(
      b.part(new THREE.ConeGeometry(0.04, 0.09, 6), EMBER, {
        bone: head,
        at: [pos[0], pos[1] + Math.cos(t) * (h / 2 + 0.04), pos[2] - Math.sin(t) * (h / 2 + 0.04)],
        rotation: [-tilt, 0, 0],
      }),
      1.3,
    );
  });

  // ---- arms ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.7, 1.95, 0],
        [s * 1.02, 1.45, 0.12],
        [s * 1.05, 0.95, 0.28],
      ]),
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    const hand = arm.tip!;
    glow(b.sweep(arm, [0.12, 0.11], { color: LAVA }), 1);
    b.along(arm, 6, (at) => {
      const r = 0.15 + 0.07 * at.t;
      b.part(hex(r, 0.15), ROCK, { frame: at, flat: true });
    });
    // pauldron: cluster of basalt columns
    [
      [0.5, 0, 0.12, 0, 0],
      [0.38, 0.17, 0.0, 0.08, 1],
      [0.32, 0.1, -0.02, -0.15, 2],
      [0.26, -0.08, 0.04, 0.16, 3],
    ].forEach(([h, dx, dy, dz, i]) => {
      b.part(hex(0.1 + 0.01 * i, h), ROCK, {
        bone: arm.joints[0],
        at: [s * (0.78 + dx), 2.02 + dy + h / 2 - 0.1, dz],
        rotation: [0, 0, -s * (12 + 6 * i)],
        flat: true,
      });
    });
    b.part(new THREE.TorusGeometry(0.22, 0.03, 5, 10), GOLD, {
      bone: arm.joints[0],
      at: [s * 0.82, 1.9, 0],
      rotation: [0, 90, -s * 10],
    });
    // gold bands at elbow and wrist
    for (const t of [0.5, 0.88]) {
      const at = arm.at(t);
      b.part(new THREE.TorusGeometry(0.2 + 0.07 * t, 0.028, 5, 10), GOLD, { frame: at, dir: at.axis, axis: "z" });
    }
    // elbow spike
    b.part(new THREE.ConeGeometry(0.07, 0.26, 6), ROCK, {
      bone: arm.joints[1],
      at: [s * 1.2, 1.5, -0.1],
      rotation: [-30, 0, -s * 70],
      flat: true,
    });
    // fist
    b.part(box(0.36, 0.3, 0.34), ROCK, { bone: hand, at: [s * 1.05, 0.82, 0.3], flat: true });
    b.part(box(0.38, 0.06, 0.36), GOLD, { bone: hand, at: [s * 1.05, 0.98, 0.3] });
    for (let i = 0; i < 3; i++) {
      const x = s * (1.05 + (i - 1) * 0.1);
      const f = b.chain(`finger${side}${i + 1}`, polyline([[x, 0.72, 0.44], [x, 0.54, 0.5]]), {
        parent: hand,
        names: [`finger${side}${i + 1}`],
        role: "digit",
      });
      b.sweep(f, [0.06, 0.045], { color: ROCK, section: { ngon: 6 } });
      glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), LAVA, { bone: f.joints[0], at: [x, 0.74, 0.46] }), 1);
    }
    const th = b.chain(`thumb${side}`, polyline([[s * 0.88, 0.84, 0.36], [s * 0.82, 0.68, 0.46]]), {
      parent: hand,
      names: [`thumb${side}`],
      role: "digit",
    });
    b.sweep(th, [0.055, 0.04], { color: ROCK, section: { ngon: 6 } });
    // molten drip
    b.part(new THREE.CapsuleGeometry(0.02, 0.07, 3, 5), HOT, { bone: hand, at: [s * 1.12, 0.62, 0.3] });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), HOT, { bone: hand, at: [s * 1.12, 0.52, 0.3] }), 1.4);
  }

  // ---- legs ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.34, 1.1, 0],
        [s * 0.4, 0.62, 0.14],
        [s * 0.4, 0.2, 0.02],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    const ankle = leg.tip!;
    glow(b.sweep(leg, 0.14, { color: LAVA }), 1);
    b.along(leg, 5, (at) => {
      b.part(hex(0.21 - 0.03 * at.t, 0.17), ROCK, { frame: at, flat: true });
    });
    const kneeAt = leg.at(0.5);
    b.part(box(0.3, 0.26, 0.2), DARK, { bone: leg.joints[1], at: [s * 0.4, 0.62, 0.3], rotation: [-15, 0, 0], flat: true });
    b.part(new THREE.TorusGeometry(0.22, 0.028, 5, 10), GOLD, { frame: kneeAt, dir: kneeAt.axis, axis: "z" });
    // foot
    b.part(box(0.44, 0.22, 0.58), ROCK, { bone: ankle, at: [s * 0.4, 0.11, 0.1], flat: true });
    b.part(box(0.46, 0.05, 0.6), GOLD, { bone: ankle, at: [s * 0.4, 0.235, 0.1] });
    for (let i = 0; i < 3; i++) {
      b.part(hex(0.085, 0.16), DARK, { bone: ankle, at: [s * (0.4 + (i - 1) * 0.15), 0.08, 0.42], rotation: [90, 0, 0], flat: true });
    }
    b.part(box(0.4, 0.2, 0.16), DARK, { bone: ankle, at: [s * 0.4, 0.1, -0.24], flat: true });
  }

  return b.root;
}
