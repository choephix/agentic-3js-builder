import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { scales } from "../../../../src/paint";
import { bezier, catmull } from "../../../../src/path";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Phoenix",
  description:
    "A cel-shaded phoenix standing with wings spread: flame plumage built from drawn feather cards, gold collar and armlets, a glowing ember gem with tassels, a halo ring and drifting embers.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const CRIMSON = "#d8281e";
const ORANGE = "#ff7a1c";
const GOLD = "#ffc83a";
const CREAM = "#fff0b0";
const DEEP = "#7a1022";
const TOE = "#e9a63a";
const CLAW = "#4a1f2c";

function featherTex(c0: string, c1: string, c2: string, rib: string, wavy: boolean) {
  const shape = wavy
    ? "M20 119 C6 100 10 80 4 60 C12 62 10 40 8 30 C16 34 16 18 20 2 C24 18 24 34 32 30 C30 40 28 62 36 60 C30 80 34 100 20 119 Z"
    : "M20 119 C5 98 2 52 20 2 C38 52 35 98 20 119 Z";
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 120"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c0}"/><stop offset="0.55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><path d="${shape}" fill="url(#g)" stroke="${DEEP}" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 114 L20 12" stroke="${rib}" stroke-width="2.4" stroke-linecap="round"/><path d="M20 98 L9 82 M20 80 L8 62 M20 62 L10 46 M20 98 L31 82 M20 80 L32 62 M20 62 L30 46" stroke="${rib}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.7"/></svg>`,
    { size: 256 },
  );
}

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 80"><rect x="8.5" y="0" width="3" height="30" fill="${DEEP}"/><circle cx="10" cy="26" r="5" fill="${GOLD}" stroke="${DEEP}" stroke-width="1.5"/><path d="M3 34 L17 34 L19 80 L1 80 Z" fill="${ORANGE}" stroke="${DEEP}" stroke-width="1.5"/><path d="M6 36 L5 80 M10 36 L10 80 M14 36 L15 80" stroke="${GOLD}" stroke-width="1.5"/></svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(5);

  const FEATH_RED = featherTex(DEEP, CRIMSON, ORANGE, GOLD, false);
  const FEATH_GOLD = featherTex(CRIMSON, ORANGE, CREAM, CREAM, false);
  const FLAME = featherTex(CRIMSON, ORANGE, GOLD, GOLD, true);

  const COAT = cel(furEdge(CRIMSON, GOLD, { level: -0.15, teeth: 0.3, period: 0.04, ink: DEEP, inkWidth: 0.05 }));
  const LEG = cel(scales(GOLD, DEEP, { size: 0.03 }));
  const HEADP = cel(
    furEdge(CRIMSON, GOLD, { by: "position", axis: [0, 1, 0], level: 1.5, teeth: 0.025, period: 0.02, along: [1, 0, 0] }),
  );

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.05] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.05],
      [0, 0.9, 0.12],
      [0, 0.98, 0.25],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.25],
      [0, 1.2, 0.38],
      [0, 1.5, 0.45],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.5, 0.45], dir: [0, 0.45, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.5, 0.56], aim: [0, 1.48, 0.74], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.8, -0.4],
      [0, 0.76, -0.62],
      [0, 0.7, -0.84],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---- body
  const bodyPath = catmull([
    [0, 0.8, -0.4],
    [0, 0.8, -0.05],
    [0, 0.9, 0.12],
    [0, 0.98, 0.25],
    [0, 1.2, 0.38],
    [0, 1.5, 0.45],
  ]);
  const ts = [0, 0.15, 0.3, 0.45, 0.58, 0.7, 0.85, 1];
  const rs = [0.05, 0.16, 0.24, 0.27, 0.24, 0.12, 0.08, 0.075];
  const body = b.sweep(bodyPath, (t): [number, number] => [0.9 * interpolate(ts, rs, t), interpolate(ts, rs, t)], {
    bone: [hips, spine, neck],
    color: COAT,
  });
  b.sweep(tail, [0.07, 0.025], { color: COAT });

  // ---- head
  const HEAD_C: [number, number, number] = [0, 1.56, 0.5];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, {
    bone: head,
    at: HEAD_C,
    scale: [0.095, 0.09, 0.115],
  });
  const skin = b.surface(skull);
  const EYE = animeEye({ iris: "#2fe0d0", blush: false });
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 38, 2);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }
  // beak
  const beakR = (t: number): [number, number] => [0.045 * (1 - t) + 0.004, 0.06 * (1 - t) + 0.004];
  b.sweep(
    bezier([0, 1.545, 0.58], [0, 1.56, 0.7], [0, 1.5, 0.79]),
    beakR,
    { bone: head, color: cel("#ffcf4a"), caps: { start: "flat", end: "point" } },
  );
  b.sweep(
    catmull([
      [0, 1.505, 0.58],
      [0, 1.49, 0.7],
      [0, 1.5, 0.75],
    ]),
    (t): [number, number] => [0.035 * (1 - t) + 0.004, 0.035 * (1 - t) + 0.004],
    { bone: jaw, color: cel("#f2b53c"), caps: { start: "flat", end: "point" } },
  );
  // crest
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.025;
    const len = 0.5 - Math.abs(k - 2) * 0.09;
    glow(
      b.cards([frame([x, 1.63, 0.46], [x * 3, 1, -0.55])], k % 2 ? FEATH_GOLD : FLAME, {
        size: [0.08, len],
        flow: [1, 0, 0],
        bend: -25,
        cross: true,
        bone: head,
        sink: 0.1,
      }),
      0.9,
    );
  }
  // long head streamers
  for (const s of [1, -1])
    glow(
      b.cards([frame([s * 0.05, 1.6, 0.42], [s * 0.35, 0.5, -1])], FEATH_RED, {
        size: [0.07, 0.6],
        flow: [0, 1, 0],
        bend: -35,
        bone: head,
      }),
      0.9,
    );

  // ---- feathers on the body
  const bodySkin = b.surface(body);
  const chest = bodySkin.scatter(110, {
    rng: rng(11),
    minDist: 0.05,
    filter: (h) => h.n.z > -0.1 && h.at.z > -0.05 && h.at.y > 0.7,
  });
  b.cards(chest, FLAME, { size: [0.09, 0.14], lean: 55, vary: 0.3, spin: 15, rng: rng(12) });
  const mantle = bodySkin.scatter(60, {
    rng: rng(13),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.4 && h.at.y > 0.85,
  });
  b.cards(mantle, FEATH_RED, { size: [0.1, 0.18], lean: 70, flow: [0, -0.2, -1], vary: 0.25, rng: rng(14) });

  // ---- collar, gem, tassels
  const collar = bodySkin.loop(neck.at(0.3), { lift: 0.012 });
  b.sweep(collar, 0.016, { color: GOLD });
  const gemHit = bodySkin.ray([0, 1.02, 1], [0, 0, -1]);
  if (gemHit) {
    b.stick(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), GOLD, gemHit, { embed: 0.3 });
    glow(
      b.stick(new THREE.OctahedronGeometry(0.045, 0), "#ff7a1a", gemHit.moved([0, 0.02, 0]), { embed: 0.2 }),
      1.4,
    );
    const base = gemHit.at;
    for (const dx of [-0.03, 0, 0.03])
      b.cards([frame([dx, base.y - 0.05, base.z + 0.03], [0, 1, 0], [0, 0, 1])], TASSEL, {
        size: [0.035, 0.16],
        lean: 180,
        flow: [0, 0, 1],
      });
  }

  // ---- tail fan
  const tailBase = [0, 0.77, -0.62];
  for (let k = 0; k < 9; k++) {
    const a = ((k - 4) / 4) * 0.85;
    const len = 1.15 - Math.abs(k - 4) * 0.1;
    glow(
      b.cards([frame(tailBase, [Math.sin(a), -0.2, -Math.cos(a)])], k % 2 ? FEATH_GOLD : FEATH_RED, {
        size: [0.16, len],
        flow: [0, 1, 0],
        bend: -25,
        vary: 0.05,
        sink: 0.05,
      }),
      0.9,
    );
  }
  for (const x of [-0.07, 0, 0.07])
    glow(
      b.cards([frame([x, 0.78, -0.6], [x * 2, -0.12, -1])], FLAME, {
        size: [0.2, 1.35],
        flow: [0, 1, 0],
        bend: -35,
        sink: 0.05,
      }),
      1,
    );

  // ---- wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.2, 1.1, 0.12],
        [s * 0.65, 1.3, -0.02],
        [s * 1.2, 1.45, 0.0],
        [s * 1.65, 1.45, -0.12],
      ]),
      {
        parent: spine.joints[1],
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.085, 0.06, 0.04, 0.025], { color: COAT });
    b.sweep(catmull(b.ring(wing.at(0.45), { count: 8, radius: 0.05 }).items, { closed: true }), 0.014, {
      color: GOLD,
    });
    // primaries
    const plen = [0.7, 0.9, 1.0, 0.98, 0.92, 0.85, 0.78, 0.7, 0.62];
    for (let k = 0; k < 9; k++) {
      const a = (-5 + (80 * k) / 8) * (Math.PI / 180);
      const o = wing.at(0.62 + 0.38 * (k / 8)).at;
      glow(
        b.cards([frame(o, [s * Math.cos(a), -0.05, -Math.sin(a)])], k % 2 ? FEATH_GOLD : FLAME, {
          size: [0.13, plen[k]],
          flow: [0, 1, 0],
          bend: -10,
          sink: 0.05,
        }),
        0.9,
      );
    }
    // secondaries
    for (let j = 0; j < 10; j++) {
      const o = wing.at(0.28 + 0.34 * (j / 9)).at;
      const len = 0.55 + 0.15 * Math.sin((Math.PI * j) / 9);
      glow(
        b.cards(
          [frame([o.x, o.y + 0.005, o.z], [s * (0.45 - 0.4 * (j / 9)), -0.04, -1])],
          j % 2 ? FEATH_RED : FEATH_GOLD,
          { size: [0.14, len], flow: [0, 1, 0], bend: -10, sink: 0.05 },
        ),
        0.85,
      );
    }
    // coverts
    for (let j = 0; j < 12; j++) {
      const o = wing.at(0.05 + 0.9 * (j / 11)).at;
      b.cards([frame([o.x, o.y + 0.02, o.z - 0.02], [s * 0.2, -0.03, -1])], FLAME, {
        size: [0.1, 0.32],
        flow: [0, 1, 0],
        sink: 0.05,
      });
    }
    for (let j = 0; j < 14; j++) {
      const o = wing.at(0.03 + 0.94 * (j / 13)).at;
      b.cards([frame([o.x, o.y + 0.035, o.z + 0.03], [s * 0.2, -0.03, -1])], FEATH_RED, {
        size: [0.07, 0.2],
        flow: [0, 1, 0],
        sink: 0.05,
      });
    }
  }

  // ---- legs and talons
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.14, 0.72, 0],
      [s * 0.17, 0.024, 0.12],
      [0.2, 0.26, 0.3],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.08, 0.055, 0.03, 0.026], { color: LEG, bands: [[0.3, COAT]] });
    const foot = leg.joints[leg.joints.length - 1];
    const F = pts[pts.length - 1];
    for (const ang of [-28, 0, 28]) {
      const a = ang * (Math.PI / 180);
      const tip: [number, number, number] = [F.x + Math.sin(a) * 0.17, 0.012, F.z + Math.cos(a) * 0.17];
      b.spike(F, tip, null, 0.022, { bone: foot, color: TOE });
      b.spike(tip, [tip[0] + Math.sin(a) * 0.05, -0.004, tip[2] + Math.cos(a) * 0.05], null, 0.013, {
        bone: foot,
        color: CLAW,
      });
    }
    const back: [number, number, number] = [F.x, 0.012, F.z - 0.1];
    b.spike(F, back, null, 0.02, { bone: foot, color: TOE });
    b.spike(back, [back[0], -0.004, back[2] - 0.045], null, 0.012, { bone: foot, color: CLAW });
  }

  // ---- halo and embers
  const halo = [0, 1.42, -0.12];
  glow(
    b.part(new THREE.TorusGeometry(0.42, 0.012, 5, 32), GOLD, { bone: spine.joints[1], at: halo, dir: [0, 0, 1], axis: "z" }),
    1.2,
  );
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    glow(
      b.part(new THREE.OctahedronGeometry(0.03, 0), CREAM, {
        bone: spine.joints[1],
        at: [Math.cos(a) * 0.42, halo[1] + Math.sin(a) * 0.42, halo[2]],
      }),
      1.2,
    );
  }
  const embers: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 30; k++) {
    const r = 0.012 + R() * 0.02;
    embers.push(
      new THREE.OctahedronGeometry(r, 0).translate((R() * 2 - 1) * 1.7, 0.35 + R() * 1.7, (R() * 2 - 1) * 0.9),
    );
  }
  const merged = mergeGeometries(embers);
  if (merged) glow(b.part(merged, "#ffb23c", { bone: hips, at: [0, 0, 0], name: "embers" }), 1.3);

  void INK;
  return b.root;
}
