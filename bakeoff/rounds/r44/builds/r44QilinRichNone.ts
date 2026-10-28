import * as THREE from "three";
import { createBuilder, rng, limb, bezier, catmull, frame, gradient, countershade, scales, svg } from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description: "Scaled, hooved chimera with jade antlers, a dragon head, a cloud mane and a flame tail, in high-fantasy anime style.",
};

const GOLD = "#f2c04a";
const JADE = "#3fd6b0";
const IVORY = "#f3e8c0";
const DARK = "#2b1a3a";

// ---------- textures ----------
const cloudSvg = (top: string, edge: string, swirl: string) =>
  svg(
    `<svg viewBox="0 0 64 96"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${top}"/></linearGradient></defs>
<path d="M20 96 C10 80 14 60 22 50 C10 44 12 28 26 28 C24 14 36 4 48 2 C44 12 52 16 54 28 C62 40 54 56 46 62 C50 74 44 88 40 96 Z" fill="url(#g)" stroke="${edge}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M30 84 C26 66 34 58 40 46 C46 38 40 30 34 34" fill="none" stroke="${swirl}" stroke-width="2.8" stroke-linecap="round"/>
<path d="M24 60 C20 52 24 46 30 48" fill="none" stroke="${swirl}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
const CLOUD_W = cloudSvg("#bff3f6", "#3a9ab0", "#6cc8d8");
const CLOUD_T = cloudSvg("#38d6c0", "#1f7f95", "#2aa8b8");
const CLOUD_G = cloudSvg("#ffe58a", "#c8892a", "#f0b640");
const FLAME = svg(
  `<svg viewBox="0 0 64 96"><defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff2a0"/><stop offset="0.5" stop-color="#ffa030"/><stop offset="1" stop-color="#ff4a6a"/></linearGradient></defs>
<path d="M22 96 C10 76 18 62 24 50 C18 40 24 28 30 20 C30 12 36 6 40 0 C44 12 54 22 52 36 C60 48 54 62 48 70 C52 82 46 90 42 96Z" fill="url(#f)" stroke="#c84a20" stroke-width="2.2"/>
<path d="M32 90 C28 74 36 64 38 52 C40 44 36 38 34 34" fill="none" stroke="#fff6c0" stroke-width="3" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#fff3c0" stroke="#7a3a10" stroke-width="3"/>
<circle cx="32" cy="32" r="21" fill="none" stroke="#3fd6b0" stroke-width="2.5"/>
<path d="M32 12 C20 14 16 28 28 32 C40 36 38 46 28 46 C22 46 20 42 22 38 M32 12 C40 14 44 20 40 24" fill="none" stroke="#c0541c" stroke-width="3.2" stroke-linecap="round"/>
<circle cx="32" cy="32" r="3" fill="#c0541c"/></svg>`,
  { size: 128 },
);
const EYE = animeEye({ iris: "#8a5cff", blush: false });

// ---------- palette ----------
const SCALE = scales(["#e9a634", "#dc8a2a", "#f0b848"], "#8a4210", { size: 0.05 });
const BODY = cel(countershade(SCALE, "#fff0c0", { level: -0.35 }));
const HORN = cel(gradient(IVORY, JADE, [0, 1.95, 1.0], [0, 2.5, 0.9]));

export default function build() {
  const b = createBuilder({ name: "qilin" });
  const R = rng(11);

  // ----- skeleton: spine -----
  const hips = b.joint("hips", { at: [0, 1.08, -0.55], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.08, -0.55],
      [0, 1.1, -0.2],
      [0, 1.14, 0.2],
      [0, 1.15, 0.5],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const body = b.sweep(spine, (t) => [0.26 + 0.05 * Math.sin(t * 3), 0.3 + 0.04 * t], { color: BODY });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.15, 0.5],
      [0, 1.35, 0.64],
      [0, 1.6, 0.74],
      [0, 1.78, 0.82],
    ]),
    { parent: spine.joints[2], role: "neck", names: ["neck1", "neck2", "neck3"] },
  );
  const neckS = b.sweep(neck, (t) => 0.2 - 0.07 * t, { color: BODY });

  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.78, 0.82], dir: [0, 0.1, 1], role: "head" });
  const H = head.at;

  // ----- head -----
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BODY, {
    bone: head,
    at: head.local({ forward: 0.1, up: 0.0 }),
    scale: [0.16, 0.15, 0.2],
  });
  const upper = b.frustumBox(
    head.local({ forward: 0.12 }),
    head.local({ forward: 0.52, up: -0.05 }),
    [0.2, 0.17],
    [0.13, 0.09],
    { bone: head, color: BODY },
  );
  void upper;
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.08 }),
    aim: head.local({ forward: 0.5, down: 0.1 }),
    role: "jaw",
  });
  b.frustumBox(head.local({ forward: 0.1, down: 0.08 }), head.local({ forward: 0.5, down: 0.1 }), [0.15, 0.06], [0.1, 0.045], {
    bone: jaw,
    color: "#f2c870",
  });
  b.part(new THREE.SphereGeometry(0.055, 8, 6), DARK, { bone: head, at: head.local({ forward: 0.54, up: -0.045 }), scale: [1.2, 0.8, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 5, 4), "#000000", { bone: head, at: head.local({ left: s * 0.03, forward: 0.58, up: -0.03 }) });
    // fangs
    b.spike(head.local({ left: s * 0.05, forward: 0.46, up: -0.09 }), [0, -1, 0], 0.06, 0.013, { bone: head, color: "#ffffff" });
    b.spike(jaw.local({ right: s * 0.04, forward: 0.4, up: 0.0 }), [0, 1, 0.1], 0.05, 0.011, { bone: jaw, color: "#ffffff" });
    // brow ridge
    b.rod(head.local({ left: s * 0.07, forward: 0.2, up: 0.1 }), head.local({ left: s * 0.12, forward: 0.0, up: 0.13 }), 0.022, {
      bone: head,
      color: "#c0701c",
    });
    // whiskers
    const w0 = head.local({ left: s * 0.07, forward: 0.5, up: -0.05 });
    b.sweep(
      bezier(w0, [w0.x + s * 0.2, w0.y - 0.05, w0.z - 0.05], [w0.x + s * 0.35, w0.y - 0.3, w0.z - 0.3], [w0.x + s * 0.42, w0.y - 0.45, w0.z - 0.45]),
      [0.012, 0.003],
      { bone: head, color: GOLD, caps: { end: "point" } },
    );
    // ear
    b.extrude(
      [
        [0, 0],
        [0.05, 0.05],
        [0.04, 0.16, "sharp"],
        [-0.02, 0.07],
      ],
      { at: head.local({ left: s * 0.1, up: 0.1, back: 0.02 }), x: [s, 0, 0], y: [s * 0.5, 1, -0.4], thickness: 0.016, color: "#e08a2a", bone: head, smoothing: 1 },
    );
    // antlers
    const o = (dx: number, dy: number, dz: number): [number, number, number] => [H.x + s * dx, H.y + dy, H.z + dz];
    const beamPts = [o(0.07, 0.12, 0.05), o(0.12, 0.3, -0.02), o(0.16, 0.52, -0.12), o(0.14, 0.72, -0.24)];
    const beam = catmull(beamPts);
    b.sweep(beam, [0.032, 0.008], {
      bone: head,
      color: HORN,
      bands: [[0.7, IVORY], [1, JADE]],
      caps: { end: "point" },
    });
    for (const [t, side, len] of [[0.35, 1, 0.2], [0.6, 1, 0.22], [0.8, -1, 0.16]] as const) {
      const p = beam.at(t);
      b.sweep(
        bezier([p.x, p.y, p.z], [p.x + s * side * 0.08, p.y + 0.08, p.z + 0.05], [p.x + s * side * 0.14, p.y + len, p.z + 0.08]),
        [0.018, 0.004],
        { bone: head, color: JADE, caps: { end: "point" } },
      );
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 5), GOLD, { bone: head, at: beamPts[0] });
  }

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 52, 8);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.085, 0.115], mirror: s > 0 });
  }
  // forehead gem
  glow(b.part(new THREE.OctahedronGeometry(0.03), "#ff6aa0", { bone: head, at: head.local({ forward: 0.24, up: 0.13 }), scale: [1, 1.4, 1] }), 1.4);

  // cheek and brow cloud tufts
  const faceHits = skin.scatter(14, { rng: rng(5), minDist: 0.07, filter: (h) => Math.abs(h.n.x) > 0.5 || h.n.y > 0.6 });
  b.cards(faceHits, [CLOUD_W, CLOUD_T], { size: [0.07, 0.1], lean: 60, flow: [0, 0.1, -1], rng: rng(6), vary: 0.3 });

  // beard under jaw
  const beard = [0.05, 0.2, 0.35].map((f) => frame(jaw.local({ forward: 0.1 + f, down: -0.01 }), [0, 1, 0]));
  b.cards(beard, CLOUD_G, { size: [0.09, 0.15], lean: 180, flow: [0, 0, 1], bone: jaw });

  // ----- mane, back and chest clouds -----
  const maneHits = b.surface(neckS).scatter(46, { rng: rng(21), minDist: 0.065, filter: (h) => h.n.y > -0.2 });
  b.cards(maneHits, [CLOUD_W, CLOUD_W, CLOUD_T], { size: [0.2, 0.3], lean: 55, bend: 25, flow: [0, 0.15, -1], rng: rng(22), vary: 0.3 });
  const backHits = b.surface(body).scatter(24, { rng: rng(31), minDist: 0.1, filter: (h) => h.n.y > 0.6 });
  b.cards(backHits, [CLOUD_T, CLOUD_W], { size: [0.15, 0.2], lean: 60, bend: 20, flow: [0, 0.1, -1], rng: rng(32), vary: 0.3 });
  const chestHits = b.surface(body).scatter(10, { rng: rng(41), minDist: 0.1, filter: (h) => h.n.z > 0.6 && h.at.y < 1.2 });
  b.cards(chestHits, CLOUD_G, { size: [0.14, 0.2], lean: 70, flow: [0, -1, -0.2], rng: rng(42), vary: 0.25 });

  // flank emblems
  const bs = b.surface(body);
  for (const s of [1, -1]) {
    const hit = bs.around([0, 1.1, -0.05]).at(s * 90, 0);
    if (hit) b.decal(bs, EMBLEM, { at: hit, dir: [s, 0, 0], size: [0.26, 0.26], mirror: s < 0 });
  }

  // ----- tail -----
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.12, -0.6],
      [0, 1.15, -0.95],
      [0, 1.3, -1.3],
      [0, 1.6, -1.5],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  const tailS = b.sweep(tail, (t) => 0.09 - 0.06 * t, { color: BODY });
  const tf = [0.4, 0.55, 0.7, 0.85, 1].map((t) => tailS.at(t, 0));
  glow(b.cards(tf, FLAME, { size: [0.22, 0.5], lean: 45, bend: 30, flow: [0, 0.4, -1], cross: true, vary: 0.2, rng: rng(51) }), 1.2);
  b.cards([tailS.at(1, 0)], CLOUD_W, { size: [0.3, 0.45], lean: 20, flow: [0, 1, -0.5] });

  // ----- legs -----
  const hoofCol = "#d99a2a";
  for (const s of [1, -1]) {
    for (const front of [true, false]) {
      const root = front ? [s * 0.25, 1.0, 0.42] : [s * 0.27, 1.05, -0.45];
      const foot = [root[0], 0.07, root[2] + (front ? 0 : 0.0)];
      const pts = front
        ? limb(root, foot, [0.45, 0.42, 0.25], [[0, 0, -1], [0, 0, 1]])
        : limb(root, foot, [0.42, 0.4, 0.3], [[0, 0, 1], [0, 0, -1]]);
      const tag = `${front ? "F" : "H"}${s > 0 ? "L" : "R"}`;
      const leg = b.chain(`leg${tag}`, pts, {
        parent: front ? spine.joints[2] : hips,
        role: "leg",
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `hoof${tag}`],
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, (t) => 0.095 - 0.05 * t, { color: BODY });
      b.part(new THREE.CylinderGeometry(0.055, 0.07, 0.1, 8), hoofCol, { bone: leg.tip!, at: [foot[0], 0.05, foot[2]] });
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.015, 8), GOLD, { bone: leg.tip!, at: [foot[0], 0.105, foot[2]] });
      const ring = b.ring(leg.joints[2], { count: 6, radius: 0.07 });
      b.cards(ring.items, CLOUD_W, { size: [0.09, 0.14], lean: 75, flow: [0, -1, 0], rng: rng(60), vary: 0.2 });
      const kneeP = pts[1];
      b.part(new THREE.SphereGeometry(0.06, 7, 5), "#e08a2a", { bone: leg.joints[1], at: [kneeP.x, kneeP.y, kneeP.z] });
    }
  }

  return b.root;
}
