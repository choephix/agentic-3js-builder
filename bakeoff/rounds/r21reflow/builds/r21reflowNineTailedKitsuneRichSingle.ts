import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { gradient } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A white nine-tailed fox spirit with red tribal markings, gold ornaments and blue-gold spirit flames burning on every tail tip.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const CREAM = "#fff8e8";
const RED = "#c9281f";
const GOLD = "#e8b53a";
const DARK = "#2b1a2e";

export default function build() {
  const b = createBuilder({ name: "nineTailedKitsune" });
  const R = rng(21);

  // ---- palette (cel paints)
  const BODY = cel(furEdge(CREAM, "#f1dcc0", { level: -0.25, teeth: 0.2, period: 0.03 }));
  const REDC = cel(RED);
  const LEGP = cel(gradient(CREAM, RED, [0, 0.19, 0], [0, 0.05, 0]));

  // ---- textures
  const flame = (a: string, m: string, c: string) =>
    svg(
      `<svg viewBox="0 0 40 80"><path d="M20 80 C2 66 4 48 14 38 C12 30 18 22 16 10 C22 16 28 8 24 0 C34 14 38 30 30 44 C38 52 36 68 20 80Z" fill="${a}"/><path d="M20 78 C10 68 12 54 19 46 C18 38 22 32 21 22 C28 32 30 44 26 52 C30 60 28 70 20 78Z" fill="${m}"/><path d="M20 74 C15 68 16 60 20 54 C24 60 25 68 20 74Z" fill="${c}"/></svg>`,
      { size: 128 },
    );
  const BLUE_FLAME = flame("#3d4be0", "#8fa6ff", "#fff4c8");
  const GOLD_FLAME = flame("#f2a81c", "#ffd86a", "#fff6d8");
  const TUFT = svg(`<svg viewBox="0 0 32 64"><path d="M16 64 C2 50 6 26 16 0 C26 26 30 50 16 64Z" fill="#ffffff"/></svg>`, {
    size: 96,
  });
  const MARK = svg(
    `<svg viewBox="0 0 64 64"><path d="M10 54 C10 30 30 38 32 22 C34 8 52 12 50 26 C48 36 36 30 38 24" stroke="${RED}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M44 54 C54 46 58 38 54 28" stroke="${RED}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M14 44 C20 40 24 44 28 40" stroke="${GOLD}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="22" cy="18" r="4" fill="${GOLD}"/></svg>`,
    { size: 192 },
  );
  const TAILMARK = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C2 44 22 34 12 18 C10 12 14 6 16 2 C24 18 30 30 22 42 C18 50 20 56 16 62Z" fill="${RED}"/><path d="M16 50 C10 40 18 34 15 24" stroke="${GOLD}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const BROW = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 2 L28 20 L16 46 L4 20Z" fill="${RED}"/><path d="M16 12 L22 21 L16 36 L10 21Z" fill="${GOLD}"/></svg>`,
    { size: 96 },
  );
  const EYELINE = svg(
    `<svg viewBox="0 0 64 24"><path d="M2 20 C20 20 36 12 62 2" stroke="${RED}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );
  const ORB = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="${GOLD}"/><circle cx="16" cy="16" r="9" fill="#ffe08a"/><circle cx="12" cy="12" r="3" fill="#fff6d8"/></svg>`,
    { size: 64 },
  );
  const EYE = animeEye({ iris: "#ffb21a" });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.54, -0.3] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.54, -0.3],
      [0, 0.54, -0.05],
      [0, 0.57, 0.22],
      [0, 0.62, 0.4],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.62, 0.4],
      [0, 0.74, 0.5],
      [0, 0.82, 0.58],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.82, 0.58], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.035 }),
    aim: head.local({ forward: 0.24, down: 0.05 }),
    role: "jaw",
  });

  // ---- body
  const body = b.loft(
    [
      { at: [0, 0.54, -0.38], w: 0.2, h: 0.22 },
      { at: [0, 0.54, -0.2], w: 0.26, h: 0.27 },
      { at: [0, 0.55, 0.05], w: 0.27, h: 0.28 },
      { at: [0, 0.58, 0.3], w: 0.27, h: 0.34 },
      { at: [0, 0.68, 0.45], w: 0.2, h: 0.26 },
      { at: [0, 0.78, 0.55], w: 0.14, h: 0.2 },
    ],
    { bone: [spine, neck], color: BODY },
  );

  // ---- head
  const HC = head.local({ forward: 0.03 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BODY, {
    bone: head,
    at: HC,
    scale: [0.085, 0.078, 0.095],
  });
  b.sweep(
    [head.local({ forward: 0.06, down: 0.005 }), head.local({ forward: 0.25, down: 0.04 })],
    (t) => [0.052 - 0.028 * t, 0.042 - 0.022 * t],
    { bone: head, color: BODY, sides: 8 },
  );
  b.sweep(
    [head.local({ forward: 0.06, down: 0.045 }), head.local({ forward: 0.23, down: 0.055 })],
    (t) => [0.036 - 0.018 * t, 0.018 - 0.007 * t],
    { bone: jaw, color: BODY, sides: 8 },
  );
  b.part(new THREE.SphereGeometry(0.016, 7, 5), DARK, { bone: head, at: head.local({ forward: 0.262, down: 0.042 }) });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HC).at(s * 40, 4)!;
    b.decal(skin, EYE, { at: eyeHit, size: [0.05, 0.068], mirror: s > 0, roll: s * 12 });
    const lineHit = skin.around(HC).at(s * 58, 6)!;
    b.decal(skin, EYELINE, { at: lineHit, size: [0.05, 0.02], mirror: s < 0 });
    // fangs
    b.spike(head.local({ left: s * 0.018, forward: 0.2, down: 0.02 }), [0, -1, 0], 0.018, 0.004, {
      color: "#ffffff",
      bone: head,
    });
    // whiskers
    for (let k = 0; k < 3; k++)
      b.rod(
        head.local({ left: s * 0.03, forward: 0.18, down: 0.03 }),
        head.local({ left: s * 0.16, forward: 0.12 - 0.02 * k, up: 0.02 - 0.03 * k }),
        0.002,
        { color: "#ffffff", bone: head, sides: 4 },
      );
    // ears
    const at = head.local({ left: s * 0.05, up: 0.075 });
    b.extrude(
      [
        [-0.045, 0],
        [0.04, 0],
        [0.05, 0.06],
        [0.018, 0.2, "sharp"],
        [-0.03, 0.07],
      ],
      { at, x: [s, 0, 0], y: [s * 0.3, 1, -0.12], thickness: 0.012, smoothing: 1, color: BODY, bone: head },
    );
    b.extrude(
      [
        [-0.025, 0.01],
        [0.025, 0.01],
        [0.012, 0.14],
        [-0.015, 0.06],
      ],
      {
        at: head.local({ left: s * 0.05, up: 0.075, forward: 0.004 }),
        x: [s, 0, 0],
        y: [s * 0.3, 1, -0.12],
        thickness: 0.018,
        color: REDC,
        bone: head,
      },
    );
    // gold ear ring with a red tassel
    const ringAt = head.local({ left: s * 0.085, up: 0.045 });
    b.part(new THREE.TorusGeometry(0.014, 0.003, 5, 10), GOLD, { at: ringAt, dir: [s, 0, 0], axis: "z", bone: head });
    b.spike(head.local({ left: s * 0.085, up: 0.03 }), [0, -1, 0], 0.06, 0.008, { color: RED, bone: head });
  }
  b.decal(skin, BROW, { at: skin.around(HC).at(0, 55)!, size: [0.045, 0.07] });

  // cheek fur
  b.cards(
    b
      .surface(skull)
      .scatter(50, { rng: rng(9), minDist: 0.025, filter: (h) => Math.abs(h.at.x) > 0.05 && h.n.y < 0.5 })
      .map((h) => h),
    TUFT,
    { size: [0.04, 0.075], lean: 60, bend: 20, vary: 0.25, rng: rng(10), color: "#fff3dc", cross: true },
  );

  // ---- coat details
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(220, {
      rng: rng(5),
      minDist: 0.03,
      filter: (h) => h.at.z > 0.28 && ((h.n.z > 0.1 && h.at.y > 0.42) || h.n.y > 0.3),
    }),
    TUFT,
    { size: [0.05, 0.1], lean: 50, bend: 25, vary: 0.3, rng: rng(6), color: "#fff3dc", cross: true },
  );
  b.cards(
    bodySkin.scatter(60, { rng: rng(8), minDist: 0.03, filter: (h) => h.at.z > 0.3 && h.at.y > 0.62 && h.n.y > 0.2 }),
    TUFT,
    { size: [0.04, 0.09], lean: 45, bend: 20, vary: 0.3, rng: rng(12), color: "#ffe9b8", cross: true },
  );
  for (const s of [1, -1])
    b.decal(body, MARK, { at: [s * 0.14, 0.6, 0.08], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s < 0 });

  // necklace + pendant
  const loop = bodySkin.loop(neck.joints[0], { lift: 0.012 });
  b.sweep(loop, 0.006, { color: GOLD });
  b.along(loop, 16, (at) => b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { at }));
  const pend = bodySkin.nearest([0, 0.58, 0.7]);
  b.stick(new THREE.SphereGeometry(0.025, 8, 6), GOLD, pend, { embed: 0.3 });
  b.spike(pend, [0, -1, 0.1], 0.1, 0.014, { color: RED });

  // ---- legs
  const legSpec = [
    { front: true, root: 0.28, foot: 0.3 },
    { front: false, root: -0.28, foot: -0.3 },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const spec of legSpec) {
      const pts = spec.front
        ? limb([s * 0.11, 0.5, spec.root], [s * 0.11, 0.035, spec.foot], [0.2, 0.2, 0.12], [
            [0, 0, -1],
            [0, 0, 1],
          ])
        : limb([s * 0.11, 0.5, spec.root], [s * 0.11, 0.035, spec.foot], [0.22, 0.2, 0.12], [
            [0, 0, 1],
            [0, 0, -1],
          ]);
      const names = spec.front
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`]
        : [`hip${S}`, `knee${S}`, `hock${S}`, `foot${S}`];
      const leg = b.chain(`leg${spec.front ? "F" : "H"}${S}`, pts, {
        parent: spec.front ? spine.joints[2] : hips,
        names,
        role: "leg",
      });
      b.sweep(leg, [0.05, 0.04, 0.03, 0.027], { color: LEGP });
      const top = leg.joints[0];
      b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
        bone: top,
        at: [s * 0.115, spec.front ? 0.46 : 0.45, spec.root],
        scale: spec.front ? [0.062, 0.1, 0.085] : [0.075, 0.11, 0.1],
      });
      const tip = leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 8, 6), REDC, {
        bone: tip,
        at: [s * 0.11, 0.03, spec.foot + 0.03],
        scale: [0.034, 0.03, 0.055],
      });
      for (const dx of [-0.018, 0, 0.018])
        b.spike([s * 0.11 + dx, 0.022, spec.foot + 0.075], [0, -0.2, 1], 0.04, 0.007, { color: GOLD, bone: tip });
    }
    // haunch orb
    b.decal(body, ORB, { at: [s * 0.14, 0.5, -0.28], dir: [s, 0, 0], size: [0.06, 0.06] });
  }

  // ---- nine tails
  const tailBase = b.joint("tailBase", { parent: hips, at: [0, 0.6, -0.32], dir: [0, 0.3, -1], role: "tail" });
  const flameBig = [] as ReturnType<typeof frame>[];
  const flameSmall = [] as ReturnType<typeof frame>[];
  const tails = [] as Array<{ ch: ReturnType<typeof b.chain> }>;
  for (let i = 0; i < 9; i++) {
    const u = (i - 4) / 4;
    const c = 1 - u * u;
    const pts = [
      [0, 0.6, -0.32],
      [0.1 * u, 0.68 + 0.08 * c, -0.6],
      [0.38 * u, 0.8 + 0.24 * c, -0.85 - 0.05 * c],
      [0.7 * u, 0.88 + 0.4 * c, -1.0 - 0.08 * c],
      [0.82 * u, 1.0 + 0.44 * c, -1.05 - 0.04 * c],
    ];
    const path = catmull(pts);
    const ch = b.chain(`tail${i + 1}`, path, {
      parent: tailBase,
      names: [`tail${i + 1}a`, `tail${i + 1}b`, `tail${i + 1}c`, `tail${i + 1}d`],
      role: "tail",
    });
    const sw = b.sweep(ch, [0.04, 0.07, 0.09, 0.085, 0.06, 0.025], {
      color: cel(gradient(CREAM, "#ffe2a0", path.at(0.55), path.at(1))),
    });
    for (const [t, ang] of [
      [0.36, 0],
      [0.58, 180],
    ]) {
      const sp = sw.at(t, ang);
      b.decal(sw, TAILMARK, { at: sp.at, dir: sp.axis, up: sp.tangent, size: [0.1, 0.22] });
    }
    // gold band
    b.sweep(path, [0.07, 0.07], { from: 0.2, to: 0.22, color: GOLD, bone: ch });
    flameBig.push(ch.at(1) as unknown as ReturnType<typeof frame>);
    for (const f of b.ring(ch.at(1), { count: 3, radius: 0.03, tilt: 25 }).items) flameSmall.push(f);
    tails.push({ ch });
  }
  glow(
    b.cards(flameBig, [BLUE_FLAME, BLUE_FLAME, GOLD_FLAME], {
      size: [0.2, 0.42],
      rng: rng(11),
      vary: 0.2,
      cross: true,
      bend: 25,
      flow: [0, 1, 0.2],
      spin: 20,
      sink: 0.25,
    }),
    1.3,
  );
  glow(
    b.cards(flameSmall, [GOLD_FLAME, BLUE_FLAME], {
      size: [0.12, 0.26],
      rng: rng(13),
      vary: 0.3,
      cross: true,
      bend: 20,
      flow: [0, 1, 0.2],
      sink: 0.2,
    }),
    1.2,
  );

  // ---- floating spirit flames
  const orbs = [
    [0.6, 0.3, 0.6],
    [-0.6, 0.3, 0.6],
    [0.45, 1.0, 0.7],
    [-0.45, 1.0, 0.7],
  ];
  for (const p of orbs) {
    glow(b.part(new THREE.SphereGeometry(0.028, 8, 6), "#bcd0ff", { at: p, bone: hips }), 1.3);
    glow(
      b.cards([frame([p[0], p[1] + 0.015, p[2]], [0, 1, 0])], [BLUE_FLAME, GOLD_FLAME], {
        size: [0.11, 0.22],
        cross: true,
        rng: rng(Math.floor(R() * 1000) + 1),
        bone: hips,
        flow: [0, 0, -1],
      }),
      1.2,
    );
  }

  return b.root;
}
