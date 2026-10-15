import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A golden nine-tailed fox spirit with cel-shaded fur, red kitsune markings, a gold crescent circlet and collar, and blue spirit flames burning on every tail tip and drifting around her.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const ORANGE = "#ff9a38";
const CREAM = "#fff3dc";
const SOCK = "#2b1a33";
const RED = "#d9293a";
const GOLD = "#f2c04a";
const TEAL = "#58e6ff";

const HEAD: [number, number, number] = [0, 1.22, 0.9];

const COAT = cel(furEdge(ORANGE, CREAM, { level: -0.25, teeth: 0.22, period: 0.03, ink: INK, inkWidth: 0.04 }));
const MUZ = cel(furEdge(ORANGE, CREAM, { level: 0.0, teeth: 0.2, period: 0.02 }));
const REDC = cel(RED);
const CREAMC = cel(CREAM);
const SOCKC = cel(SOCK);

// Brush-stroke flame bands on the flanks.
const BODY = paint((p, n) => {
  const bz = p.z - 0.05 + 0.05 * Math.sin(p.y * 14);
  const mark =
    Math.abs(n.x) > 0.55 && n.y < 0.6 && (Math.abs(bz) < 0.022 || Math.abs(bz - 0.17) < 0.016 || Math.abs(bz + 0.17) < 0.016);
  return mark ? REDC : COAT;
});

const LEGP = cel(furEdge(ORANGE, SOCK, { by: "position", level: 0.27, teeth: 0.06, period: 0.035, along: [1, 0, 1], ink: INK }));

function ringPts(c: THREE.Vector3, tdir: THREE.Vector3, r: number, n: number) {
  const t = tdir.clone().normalize();
  const w = t.clone().cross(new THREE.Vector3(1, 0, 0)).normalize();
  const u = w.clone().cross(t).normalize();
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push(c.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(w, Math.sin(a) * r));
  }
  return out;
}

const TR = (t: number) => 0.04 + 0.13 * Math.sin(Math.PI * Math.pow(t, 0.6)) * (1 - 0.25 * t);

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const rand = rng(11);

  // ---------- textures ----------
  const flameTex = svg(
    `<svg viewBox="0 0 64 96">
      <path d="M32 94 C6 80 6 50 24 34 C24 50 36 52 34 30 C33 20 28 12 32 2 C46 18 62 44 58 66 C56 82 46 92 32 94 Z" fill="#2f7bff"/>
      <path d="M32 90 C14 78 14 56 27 42 C28 54 38 54 38 40 C38 34 36 30 36 26 C48 40 52 60 48 72 C45 84 40 88 32 90 Z" fill="${TEAL}"/>
      <path d="M32 86 C22 76 22 62 30 52 C32 60 40 62 40 70 C40 80 36 84 32 86 Z" fill="#eafcff"/>
    </svg>`,
    { size: 192 },
  );
  const tuftTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C2 44 4 22 16 2 C28 22 30 44 16 62 Z" fill="${CREAM}"/>
      <path d="M16 62 C8 46 9 30 16 12 C23 30 24 46 16 62 Z" fill="#ffe3b8"/></svg>`,
    { size: 96 },
  );
  const tailTuftTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C2 44 4 22 16 2 C28 22 30 44 16 62 Z" fill="#ffb25c"/>
      <path d="M16 62 C9 46 10 30 16 8 C22 30 23 46 16 62 Z" fill="#fff0d0"/></svg>`,
    { size: 96 },
  );
  const foreheadTex = svg(
    `<svg viewBox="0 0 40 60"><path d="M20 2 C32 20 34 38 20 58 C6 38 8 20 20 2 Z" fill="${RED}"/>
      <path d="M20 14 C25 26 25 36 20 46 C15 36 15 26 20 14 Z" fill="${GOLD}"/></svg>`,
    { size: 128 },
  );
  const cheekTex = svg(
    `<svg viewBox="0 0 60 40" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round">
      <path d="M2 8 Q30 2 58 12"/><path d="M6 20 Q32 14 58 24"/><path d="M12 32 Q36 26 56 34"/></svg>`,
    { size: 256 },
  );
  const browTex = svg(
    `<svg viewBox="0 0 60 30" fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round">
      <path d="M4 24 Q22 4 56 6"/></svg>`,
    { size: 192 },
  );
  const EYE = animeEye({ iris: "#9b5cff", irisLight: "#e0a8ff" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.78, -0.32] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.32],
      [0, 0.82, 0.1],
      [0, 0.9, 0.5],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.92, 0.48],
      [0, 1.08, 0.66],
      [0, 1.2, 0.8],
    ]),
    { parent: spine.joints[2], count: 2, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.2, 0.8],
    dir: [0, 0.1, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.17, 0.95], aim: [0, 1.14, 1.15], role: "jaw" });

  // ---------- body ----------
  b.sweep(spine, (t) => [0.15 + 0.04 * t, 0.17 + 0.05 * t], { color: BODY });
  const neckSweep = b.sweep(neck, [0.125, 0.09], { color: COAT });

  // chest ruff
  const ruffHits = b.surface(neckSweep).scatter(70, { rng: rng(3), minDist: 0.045, filter: (h) => h.n.y < 0.35 });
  b.cards(ruffHits, tuftTex, { size: [0.06, 0.12], lean: 50, bend: 20, vary: 0.25, rng: rng(4), spin: 20 });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fpts = limb([s * 0.12, 0.8, 0.4], [s * 0.13, 0.05, 0.5], [0.4, 0.4], [[0, 0, -1]]);
    const fleg = b.chain(`legF${side}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
    });
    b.sweep(fleg, [0.075, 0.05, 0.04], { color: LEGP });
    b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: fleg.joints[0],
      at: [s * 0.13, 0.76, 0.42],
      scale: [0.1, 0.14, 0.15],
    });
    const fpaw = fleg.joints[fleg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCKC, {
      bone: fpaw,
      at: [s * 0.13, 0.045, 0.55],
      scale: [0.055, 0.045, 0.09],
    });
    for (let k = -1; k <= 1; k++)
      b.spike([s * 0.13 + k * 0.022, 0.03, 0.62], [0, -0.25, 1], 0.035, 0.007, {
        color: CREAM,
        bone: fpaw,
        sides: 5,
      });

    // hind (digitigrade)
    const hpts = limb(
      [s * 0.15, 0.78, -0.3],
      [s * 0.15, 0.05, -0.38],
      [0.36, 0.36, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hleg = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(hleg, [0.1, 0.07, 0.045, 0.04], { color: LEGP });
    b.part(new THREE.SphereGeometry(1, 10, 8), BODY, {
      bone: hleg.joints[0],
      at: [s * 0.14, 0.7, -0.3],
      scale: [0.12, 0.17, 0.21],
    });
    const hpaw = hleg.joints[hleg.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 8, 6), SOCKC, {
      bone: hpaw,
      at: [s * 0.15, 0.045, -0.32],
      scale: [0.055, 0.045, 0.1],
    });
    for (let k = -1; k <= 1; k++)
      b.spike([s * 0.15 + k * 0.022, 0.03, -0.24], [0, -0.25, 1], 0.035, 0.007, {
        color: CREAM,
        bone: hpaw,
        sides: 5,
      });
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), MUZ, {
    bone: head,
    at: HEAD,
    scale: [0.1, 0.09, 0.11],
  });
  b.sweep(
    [
      [0, 1.2, 0.97],
      [0, 1.17, 1.17],
    ],
    (t) => [0.05 - 0.025 * t, 0.042 - 0.02 * t],
    { color: MUZ, bone: head },
  );
  b.part(new THREE.SphereGeometry(0.022, 8, 6), SOCKC, { bone: head, at: [0, 1.168, 1.19], scale: [1.2, 0.9, 1] });
  b.sweep(
    [
      [0, 1.15, 0.96],
      [0, 1.135, 1.14],
    ],
    [0.04, 0.018],
    { color: CREAMC, bone: jaw },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.028, 1.146, 1.12], [0, -1, 0], 0.028, 0.008, { color: "#ffffff", bone: head, sides: 5 });
    for (let k = 0; k < 3; k++) {
      const a: [number, number, number] = [s * (0.045 + k * 0.011), 1.205 - k * 0.01, 1.0 + k * 0.045];
      const e: [number, number, number] = [s * (0.2 + k * 0.03), 1.235 - k * 0.025, 0.95 + k * 0.05];
      b.rod(a, e, 0.0025, { color: CREAM, bone: head, sides: 4 });
    }
    // ears
    const earAt: [number, number, number] = [s * 0.062, HEAD[1] + 0.075, HEAD[2] - 0.03];
    const ear = b.extrude(
      [
        [-0.07, 0],
        [-0.04, 0.14],
        [0, 0.27, "sharp"],
        [0.04, 0.14],
        [0.07, 0],
      ],
      {
        at: earAt,
        x: [1, 0, 0],
        y: [s * 0.3, 1, -0.15],
        thickness: 0.022,
        bevel: 0.004,
        smoothing: 1,
        color: cel(paint((_p, _n, c) => (c[1] > 0.15 ? SOCK : ORANGE))),
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.045, 0.01],
        [0, 0.21, "sharp"],
        [0.045, 0.01],
      ],
      {
        at: [earAt[0], earAt[1] + 0.006, earAt[2] + 0.012],
        x: [1, 0, 0],
        y: [s * 0.3, 1, -0.15],
        thickness: 0.012,
        bevel: 0.003,
        color: cel("#ffb3b8"),
        bone: head,
      },
    );
    b.spike(ear.local([0, 0.27, 0]), [s * 0.3, 1, -0.15], 0.04, 0.012, { color: GOLD, bone: head, sides: 5 });
  }

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eye = skin.around(HEAD).at(s * 38, 2);
    if (eye) b.decal(skin, EYE, { at: eye, size: [0.055, 0.075], mirror: s > 0 });
    const brow = skin.around(HEAD).at(s * 34, 30);
    if (brow) b.decal(skin, browTex, { at: brow, size: [0.05, 0.026], mirror: s < 0 });
    const cheek = skin.around(HEAD).at(s * 72, -10);
    if (cheek) b.decal(skin, cheekTex, { at: cheek, size: [0.07, 0.045], mirror: s > 0 });
  }
  const fore = skin.around(HEAD).at(0, 58);
  if (fore) b.decal(skin, foreheadTex, { at: fore, size: [0.035, 0.05] });

  // cheek fluff
  const cheekHits = skin.scatter(40, {
    rng: rng(5),
    minDist: 0.04,
    filter: (h) => Math.abs(h.at.x) > 0.07 && h.at.z < HEAD[2] + 0.02 && h.at.y < HEAD[1] + 0.01,
  });
  b.cards(cheekHits, tuftTex, { size: [0.045, 0.085], lean: 60, bend: 20, vary: 0.2, rng: rng(6) });

  // crescent circlet
  b.extrude(
    [
      [-0.06, 0],
      [-0.075, 0.06],
      [-0.06, 0.12, "sharp"],
      [-0.03, 0.07],
      [0, 0.05],
      [0.03, 0.07],
      [0.06, 0.12, "sharp"],
      [0.075, 0.06],
      [0.06, 0],
      [0, -0.02],
    ],
    { at: [0, HEAD[1] + 0.045, HEAD[2] + 0.075], x: [1, 0, 0], y: [0, 1, -0.45], thickness: 0.012, bevel: 0.003, color: GOLD, bone: head },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.014), "#ff4f7a", { bone: head, at: [0, HEAD[1] + 0.07, HEAD[2] + 0.09] }), 1.2);

  // ---------- collar and pendant ----------
  const cc = neck.path.at(0.55);
  const ct = neck.path.tangentAt(0.55);
  const cpts = ringPts(cc, ct, 0.135, 12);
  b.sweep(catmull(cpts, { closed: true }), 0.014, { color: GOLD, sides: 6, bone: neck.joints[1] });
  let front = cpts[0];
  for (const p of cpts) if (p.z > front.z) front = p;
  const pend = offset(front, [0, -1, 0], 0.045);
  b.part(new THREE.TorusGeometry(0.04, 0.008, 6, 12), GOLD, { bone: neck.joints[1], at: pend, dir: [0, 0, 1], axis: "z" });
  glow(b.part(new THREE.OctahedronGeometry(0.03), TEAL, { bone: neck.joints[1], at: pend }), 1.3);
  for (let k = -1; k <= 1; k++) {
    const top = offset(pend, [0, -1, 0], 0.045);
    top.x += k * 0.02;
    const bot = offset(top, [0, -1, 0], 0.1 + (k === 0 ? 0.04 : 0));
    b.rod(top, bot, 0.005, { color: GOLD, bone: neck.joints[1], sides: 5 });
    b.spike(bot, [0, -1, 0], 0.07, 0.016, { color: RED, bone: neck.joints[1], sides: 6 });
    b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { bone: neck.joints[1], at: bot });
  }

  // ---------- nine tails ----------
  const tipFrames = [];
  for (let i = 0; i < 9; i++) {
    const d = Math.abs(i - 4) / 4;
    const a = ((i - 4) / 4) * (75 * Math.PI) / 180;
    const k = 0.35 + 0.5 * (1 - d);
    const h = new THREE.Vector3(Math.sin(a) * 1.15, 0, -Math.cos(a));
    const p0 = new THREE.Vector3(Math.sin(a) * 0.05, 0.84, -0.46);
    const pts = [
      p0,
      p0.clone().addScaledVector(h, 0.3).add(new THREE.Vector3(0, 0.08, 0)),
      p0.clone().addScaledVector(h, 0.6).add(new THREE.Vector3(0, 0.15 + 0.35 * k, 0)),
      p0.clone().addScaledVector(h, 0.8).add(new THREE.Vector3(0, 0.3 + 0.65 * k, 0)),
    ];
    const path = catmull(pts);
    const name = `tail${String.fromCharCode(65 + i)}`;
    const tail = b.chain(name, path, { parent: hips, count: 4, role: "tail" });
    const tailPaint = cel(gradient2(path.at(0.6), path.at(0.88)));
    const tsw = b.sweep(tail, TR, { color: tailPaint });
    // gold band
    const tb = ringPts(path.at(0.2), path.tangentAt(0.2), TR(0.2) * 1.08 + 0.01, 10);
    b.sweep(catmull(tb, { closed: true }), 0.011, { color: GOLD, sides: 6, bone: tail.joints[1] });
    // fluff cards
    const hits = b.surface(tsw).scatter(16, { rng: rng(20 + i), minDist: 0.07, filter: (hh) => hh.n.y > -0.2 });
    b.cards(hits, tailTuftTex, { size: [0.05, 0.1], lean: 55, bend: 20, vary: 0.25, rng: rng(40 + i) });
    tipFrames.push(frame(offset(path.at(1), [0, 1, 0], 0.03), [0, 1, 0]));
  }
  glow(b.cards(tipFrames, flameTex, { size: [0.22, 0.36], cross: true, flow: [0, 0, 1], sink: 0.2 }), 1.3);

  // ---------- drifting spirit flames ----------
  const orbs: Array<[number, number, number]> = [
    [0.9, 0.5, 0.7],
    [-0.9, 0.55, 0.65],
    [0.7, 1.45, 0.35],
    [-0.7, 1.5, 0.4],
    [0.5, 0.3, 1.15],
    [-0.5, 0.25, 1.2],
    [0, 1.85, 0.3],
  ];
  const orbFrames = orbs.map((p) => frame(p, [0, 1, 0]));
  glow(b.cards(orbFrames, flameTex, { size: [0.14, 0.22], cross: true, flow: [0, 0, 1], vary: 0.2, rng: rand, bone: hips }), 1.3);
  for (const p of orbs)
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 5), "#cdf6ff", { bone: hips, at: [p[0], p[1] - 0.01, p[2]] }), 1.4);

  return b.root;
}

// A soft orange-to-cream fade along the tail's last stretch.
import { gradient } from "../../../../src/paint";
import type { Vector3 } from "three";
function gradient2(from: Vector3, to: Vector3) {
  return gradient(ORANGE, CREAM, from, to);
}
