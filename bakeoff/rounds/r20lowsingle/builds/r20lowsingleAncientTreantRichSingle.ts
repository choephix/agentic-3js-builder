import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { lerp, rng } from "../../../../src/math";
import type { FrameInput } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, grain, mottle, paint, spots } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: barrel trunk body, root legs, huge gnarled arms with twig fingers, mossy pauldrons, glowing amber eyes and a leafy crown. Hand-painted, heavy and heroic.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const BARK = "#5b3a22";
const BARK_D = "#3a2415";
const BARK_L = "#8a5e36";
const TWIG = "#6b4529";
const HEART = "#c28a4a";
const MOSS = "#4f8f2b";
const MOSS_L = "#86c13d";
const MOSS_D = "#2f5f22";
const AMBER = "#ffb52e";
const BRONZE = "#b5802d";
const CREAM = "#f2e3b8";
const FUNG = "#d9482b";
const DARK = "#1a0d08";
const CLAW = "#d8c08a";
const LEAFS = ["#5cb02e", "#3f8f2a", "#8cc63f", "#d9a62e"];

export default function build() {
  const R = rng(7);
  const b = createBuilder({ name: "ancientTreant" });

  // ---------- textures ----------
  const leaf = (c1: string, c2: string, vein: string) =>
    svg(
      `<svg viewBox="0 0 48 80"><path d="M24 79 C2 58 1 24 24 1 C47 24 46 58 24 79Z" fill="${c1}"/><path d="M24 79 C2 58 1 24 24 1 L24 79Z" fill="${c2}"/><path d="M24 78 L24 10 M24 56 L12 42 M24 56 L36 42 M24 38 L14 26 M24 38 L34 26" stroke="${vein}" stroke-width="2.6" fill="none"/></svg>`,
      { size: 128 },
    );
  const leafTex = [
    leaf("#5cb02e", "#3f8f2a", "#2a5f1c"),
    leaf("#8cc63f", "#5cb02e", "#3a7a22"),
    leaf("#3f8f2a", "#2f6f22", "#1f4f18"),
    leaf("#e0b23a", "#c2812a", "#7a4a1a"),
  ];
  const tuftTex = svg(
    `<svg viewBox="0 0 48 40"><path d="M4 40 Q2 20 9 3 Q15 22 18 40Z" fill="#4f8f2b"/><path d="M14 40 Q14 16 24 1 Q28 22 30 40Z" fill="#86c13d"/><path d="M26 40 Q30 18 40 5 Q41 24 38 40Z" fill="#3f7a24"/><path d="M34 40 Q38 24 46 14 Q46 30 44 40Z" fill="#6db033"/></svg>`,
    { size: 128 },
  );
  const hangTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M2 64 Q6 30 16 2 Q26 30 30 64Z" fill="#3f7a24"/><path d="M10 64 Q14 34 16 10 Q20 36 22 64Z" fill="#6db033"/></svg>`,
    { size: 128 },
  );
  const runeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ffb52e" stroke-width="2.6"/><circle cx="32" cy="32" r="21" fill="none" stroke="#ffd27a" stroke-width="2.6"/><path d="M32 12 L32 52 M32 22 L44 34 M32 32 L20 44 M22 20 L32 12 L42 20" stroke="#ffb52e" stroke-width="2.8" fill="none" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );

  // ---------- paints ----------
  const barkPaint = mottle(grain(BARK_D, BARK, { size: 0.06, axis: "y" }), BARK_L, {
    size: 0.5,
    seed: 3,
    contrast: 0.8,
  });
  const barkUnder = mottle(BARK_D, "#2a1a10", { size: 0.3, seed: 4 });
  const under = countershade(barkPaint, barkUnder, { level: -0.1, soft: 0.4 });
  const mossTop = mottle(MOSS, MOSS_L, { size: 0.14, seed: 5 });
  const mossy = countershade(mossTop, under, { level: 0.45, soft: 0.2 });
  const mossyLow = countershade(mossTop, under, { level: 0.75, soft: 0.15 });
  const faceWood = mottle(HEART, BARK_L, { size: 0.2, seed: 9 });
  const headPaint = paint((p, n) => (p.z > 0.55 && p.y < 3.88 ? faceWood : mossy).at(p, n));
  const capPaint = spots(FUNG, CREAM, { size: 0.06, amount: 0.5 });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.5, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.5, 0],
      [0, 1.95, 0.04],
      [0, 2.45, 0.1],
      [0, 2.9, 0.13],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 2.9, 0.13],
      [0, 3.3, 0.3],
    ]),
    { parent: chest, names: ["neck1"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 3.3, 0.3], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.4, 0.25], aim: [0, 3.36, 0.8], role: "jaw" });

  // ---------- torso ----------
  const prof = [
    [0, 0.62, 0.52],
    [0.25, 0.64, 0.55],
    [0.55, 0.92, 0.78],
    [0.8, 1.0, 0.8],
    [1, 0.72, 0.5],
  ];
  const tor = (t: number): [number, number] => {
    for (let i = 0; i < prof.length - 1; i++) {
      const a = prof[i];
      const c = prof[i + 1];
      if (t <= c[0]) {
        const k = (t - a[0]) / (c[0] - a[0]);
        return [a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];
      }
    }
    return [prof[prof.length - 1][1], prof[prof.length - 1][2]];
  };
  const torso = b.sweep(
    catmull([
      [0, 1.25, -0.02],
      [0, 1.5, 0],
      [0, 1.95, 0.04],
      [0, 2.45, 0.1],
      [0, 2.85, 0.13],
    ]),
    tor,
    { bone: [hips, spine], color: mossy, sides: 10, name: "torso" },
  );
  const skin = b.surface(torso);

  const plates = (target: Parameters<typeof b.surface>[0], count: number, seed: number, minDist: number, sc: number) => {
    const hits = b.surface(target).scatter(count, { rng: rng(seed), minDist, filter: (h) => h.n.y > -0.4 });
    hits.forEach((h, i) => {
      b.stick(new THREE.BoxGeometry(0.15 * sc, 0.06 * sc, 0.3 * sc), i % 3 === 0 ? BARK_L : i % 3 === 1 ? BARK_D : MOSS_D, h, {
        flow: [0, 1, 0],
        spin: R() * 40 - 20,
        embed: 0.5,
      });
    });
  };
  plates(torso, 70, 11, 0.17, 1);

  // belt vine and strap
  b.sweep(skin.loop(spine.joints[0], { lift: 0.04 }), 0.07, "#6b4a2a", { sides: 6, name: "belt" });
  b.sweep(skin.loop(spine.joints[1], { lift: 0.03 }), 0.04, MOSS_D, { sides: 5, name: "vine" });
  b.sweep(
    skin.drape(
      catmull([
        [-0.8, 2.8, 0.3],
        [-0.4, 2.4, 0.8],
        [0.2, 1.9, 0.85],
        [0.7, 1.6, 0.6],
      ]),
      { lift: 0.03 },
    ),
    0.05,
    "#7a5230",
    { sides: 6, name: "strap" },
  );
  const buckle = skin.around([0, 1.5, 0]).at(0, 0);
  if (buckle) {
    b.stick(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10), BRONZE, buckle, { embed: 0.3 });
    glow(b.stick(new THREE.SphereGeometry(0.07, 8, 6), AMBER, buckle.moved([0, 0.04, 0]), { embed: 0.2 }), 1.5);
  }
  // chest rune
  glow(
    b.decal(torso, runeTex, { at: [0, 2.5, 0.9], dir: [0, 0, 1], size: [0.55, 0.55], color: "#ffffff", name: "rune" }),
    1.4,
  );

  // shelf mushrooms
  const cap = (s: number): [number, number][] => [
    [0, 0],
    [0.2 * s, 0],
    [0.22 * s, 0.03 * s],
    [0.12 * s, 0.08 * s],
    [0, 0.1 * s],
  ];
  const mush = (az: number, el: number, sc: number) => {
    const h = skin.around([0, 2.2, 0.1]).at(az, el);
    if (h) b.lathe(cap(sc), { at: h, axis: [h.n.x, h.n.y, h.n.z], color: capPaint, segments: 8 });
  };
  mush(70, 10, 1.2);
  mush(100, -15, 0.9);
  mush(-75, 20, 1.3);
  mush(-110, 0, 1);
  mush(35, 40, 0.8);
  mush(150, 0, 1.1);
  mush(-150, 15, 0.9);

  // moss tufts on shoulders/back
  const mossHits = skin.scatter(60, { rng: rng(21), minDist: 0.12, filter: (h) => h.n.y > 0.3 });
  b.cards(mossHits, tuftTex, { size: [0.16, 0.22], lean: 20, cross: true, vary: 0.3, rng: rng(22), spin: 180 });

  // moss kilt
  const kilt: FrameInput[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    kilt.push(frame([Math.cos(a) * 0.66, 1.42, Math.sin(a) * 0.58], [0, 1, 0]));
  }
  b.cards(kilt, hangTex, { size: [0.2, 0.5], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(23), bone: hips });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const x = Math.cos(a) * 0.62;
    const z = Math.sin(a) * 0.54;
    b.sweep(
      catmull([
        [x, 1.4, z],
        [x * 1.1, 1.05, z * 1.1],
        [x * 1.2, 0.8, z * 1.2],
        [x * 1.3, 0.62, z * 1.3],
      ]),
      [0.06, 0.015],
      { bone: hips, color: i % 2 ? TWIG : MOSS_D, sides: 5, name: "tendril" },
    );
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.42, 1.45, 0], [s * 0.46, 0.27, 0.06], [0.7, 0.7], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.46, 0, 0.1],
    });
    const legSweep = b.sweep(leg, [0.34, 0.27, 0.22], { color: mossyLow, sides: 8, name: `leg${side}` });
    plates(legSweep, 18, 30 + (s > 0 ? 0 : 1), 0.18, 0.8);
    b.spike(pts[1], [0, 0.1, 1], 0.28, 0.12, BARK_L, { bone: leg.joints[1], sides: 6 });
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 10, 7), mossyLow, {
      bone: ankle,
      at: [s * 0.46, 0.15, 0.12],
      scale: [0.34, 0.15, 0.5],
    });
    for (let i = 0; i < 4; i++) {
      const a = (i - 1.5) * 0.38;
      const x0 = s * 0.46;
      const dx = Math.sin(a) * 0.6;
      const dz = Math.cos(a) * 0.7;
      b.sweep(
        catmull([
          [x0 + dx * 0.2, 0.2, 0.1],
          [x0 + dx * 0.6, 0.13, 0.1 + dz * 0.5],
          [x0 + dx, 0.07, 0.1 + dz],
        ]),
        [0.12, 0.07],
        { bone: ankle, color: barkPaint, sides: 6, caps: { start: "round", end: "flat" }, name: "toe" },
      );
      b.spike([x0 + dx, 0.07, 0.1 + dz], [dx, 0, dz], 0.17, 0.065, CLAW, { bone: ankle, sides: 6 });
    }
    b.sweep(
      catmull([
        [s * 0.46, 0.2, 0.0],
        [s * 0.46, 0.12, -0.2],
        [s * 0.46, 0.07, -0.4],
      ]),
      [0.11, 0.07],
      { bone: ankle, color: barkPaint, sides: 6, caps: { start: "round", end: "flat" }, name: "heel" },
    );
  }

  // ---------- arms ----------
  const up = new THREE.Vector3(0, 1, 0);
  const handSets: { dir: THREE.Vector3; wristPt: THREE.Vector3; wrist: Joint; s: number; side: string }[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.98, 2.75, 0.1], [s * 1.95, 1.55, 0.6], [1.0, 1.0], [[0, -0.3, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const armSweep = b.sweep(arm, [0.34, 0.3, 0.25], { color: mossyLow, sides: 8, name: `arm${side}` });
    plates(armSweep, 18, 40 + (s > 0 ? 0 : 1), 0.18, 0.8);
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    b.spike(pts[1], [0, 0, -1], 0.32, 0.11, BARK_L, { bone: elbow, sides: 6 });
    const dir = pts[2].clone().sub(pts[1]).normalize();
    handSets.push({ dir, wristPt: pts[2], wrist: arm.tip!, s, side });

    // pauldron with thorns and branches
    const pc = new THREE.Vector3(s * 1.05, 3.0, 0.08);
    const pauld = b.part(new THREE.SphereGeometry(1, 10, 8), mossy, {
      bone: shoulder,
      at: pc,
      scale: [0.58, 0.42, 0.55],
    });
    const thornDirs = [
      [s, 0.8, 0],
      [s * 0.6, 0.8, 0.5],
      [s * 0.6, 0.8, -0.5],
      [s * 0.2, 1, 0],
    ];
    for (const d of thornDirs) {
      const dv = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      b.spike(pc.clone().addScaledVector(dv, 0.3), dv, 0.34, 0.075, BARK_L, { bone: shoulder, sides: 6 });
    }
    const ph = b.surface(pauld).scatter(14, { rng: rng(50 + (s > 0 ? 0 : 1)), minDist: 0.15, filter: (h) => h.n.y > 0.2 });
    b.cards(ph, tuftTex, { size: [0.15, 0.2], lean: 15, cross: true, vary: 0.3, rng: rng(51) });
    shoulderBranches.push({ pc, s, shoulder });

    // bronze cuffs
    for (const k of [0.62, 0.8]) {
      const c = lerp(pts[1], pts[2], k);
      const band = b.ring(frame(c, dir), { count: 10, radius: 0.31 - k * 0.05 });
      b.sweep(catmull(band.items, { closed: true }), 0.035, BRONZE, { sides: 5, name: "cuff" });
    }
  }

  // ---------- hands ----------
  for (const h of handSets) {
    const { dir, wristPt, wrist, s, side } = h;
    b.part(new THREE.SphereGeometry(1, 10, 8), barkPaint, {
      bone: wrist,
      at: wristPt.clone().addScaledVector(dir, 0.12),
      scale: [0.28, 0.28, 0.28],
    });
    const sideV = new THREE.Vector3().crossVectors(dir, up).normalize();
    const curl = new THREE.Vector3().crossVectors(sideV, dir).normalize();
    if (curl.dot(new THREE.Vector3(0, -0.3, 1)) < 0) curl.negate();
    const lens = [0.5, 0.58, 0.54, 0.42, 0.38];
    const offs = [-0.17, -0.06, 0.06, 0.17, -0.32];
    for (let i = 0; i < 5; i++) {
      const thumb = i === 4;
      const base = wristPt
        .clone()
        .addScaledVector(dir, thumb ? 0.1 : 0.2)
        .addScaledVector(sideV, offs[i] * (thumb ? 1 : 1.0));
      const len = lens[i];
      const mid = base.clone().addScaledVector(dir, len * 0.5).addScaledVector(curl, 0.04);
      const tip = base.clone().addScaledVector(dir, len * 0.95).addScaledVector(curl, thumb ? 0.22 : 0.18);
      const f = b.chain(`finger${i}${side}`, catmull([base, mid, tip]), {
        parent: wrist,
        names: [`finger${i}A${side}`, `finger${i}B${side}`],
        role: "digit",
      });
      b.sweep(f, [0.08, 0.055, 0.03], { color: i % 2 ? BARK : TWIG, sides: 6, caps: { start: "round", end: "round" }, name: "finger" });
      b.spike(tip, tip.clone().sub(mid), 0.14, 0.032, CLAW, { bone: f.joints[1], sides: 5 });
    }
    // knuckle burls
    for (let i = 0; i < 4; i++) {
      const p = wristPt
        .clone()
        .addScaledVector(dir, 0.22)
        .addScaledVector(sideV, offs[i])
        .addScaledVector(curl, -0.12 * s * s);
      b.part(new THREE.SphereGeometry(0.07, 6, 5), BARK_L, { bone: wrist, at: p });
    }
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), headPaint, {
    bone: head,
    at: [0, 3.6, 0.35],
    scale: [0.5, 0.46, 0.5],
    name: "skull",
  });
  b.frustumBox([0, 3.54, 0.5], [0, 3.53, 0.9], [0.62, 0.18], [0.5, 0.16], { bone: head, color: faceWood, name: "snout" });
  b.frustumBox([0, 3.33, 0.28], [0, 3.32, 0.8], [0.6, 0.12], [0.44, 0.1], { bone: jaw, color: barkPaint, name: "jawbox" });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), barkPaint, { bone: jaw, at: [0, 3.3, 0.8] });
  b.part(new THREE.BoxGeometry(0.46, 0.07, 0.5), DARK, { bone: jaw, at: [0, 3.41, 0.55] });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), faceWood, { bone: head, at: [0, 3.65, 0.88] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.025, 5, 4), DARK, { bone: head, at: [s * 0.05, 3.62, 0.96] });
    // eyes
    b.part(new THREE.SphereGeometry(0.1, 8, 6), DARK, { bone: head, at: [s * 0.2, 3.73, 0.71] });
    glow(b.part(new THREE.SphereGeometry(0.07, 8, 6), AMBER, { bone: head, at: [s * 0.2, 3.73, 0.76] }), 1.6);
    // brow ridge
    b.capsule([s * 0.42, 3.9, 0.58], [s * 0.06, 3.82, 0.84], 0.08, barkPaint, { bone: head, sides: 6, name: "brow" });
    // ear shelf fungi
    b.lathe(cap(1.3), {
      at: [s * 0.5, 3.65, 0.3],
      axis: [s, 0.3, 0],
      color: capPaint,
      bone: head,
      segments: 8,
    });
    // tusks
    for (const x of [0.12, 0.24]) {
      b.spike([s * x, 3.37, 0.72], [0, 1, 0], 0.13, 0.03, CREAM, { bone: jaw, sides: 5 });
    }
    b.spike([s * 0.18, 3.46, 0.82], [0, -1, 0], 0.1, 0.03, CREAM, { bone: head, sides: 5 });
    // beard roots
    b.sweep(
      catmull([
        [s * 0.15, 3.3, 0.65],
        [s * 0.2, 3.05, 0.8],
        [s * 0.17, 2.8, 0.92],
        [s * 0.15, 2.65, 0.95],
      ]),
      [0.05, 0.015],
      { bone: jaw, color: MOSS_D, sides: 5, name: "beard" },
    );
  }
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 5), AMBER, { bone: head, at: [0, 3.95, 0.7] }), 1.5);
  b.sweep(
    catmull([
      [-0.1, 3.88, 0.72],
      [0, 3.93, 0.74],
      [0.1, 3.88, 0.72],
    ]),
    0.015,
    BRONZE,
    { bone: head, sides: 5 },
  );
  const beard: FrameInput[] = [];
  for (let i = 0; i < 9; i++) beard.push(frame([(i - 4) * 0.07, 3.29, 0.5 + 0.3 * (1 - Math.abs(i - 4) / 4)], [0, 1, 0]));
  b.cards(beard, hangTex, { size: [0.14, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(60), bone: jaw });
  const sh = b.surface(skull).scatter(34, { rng: rng(61), minDist: 0.1, filter: (h) => h.n.y > 0.3 });
  b.cards(sh, tuftTex, { size: [0.14, 0.2], lean: 20, cross: true, vary: 0.3, rng: rng(62), spin: 180 });
  plates(skull, 12, 63, 0.14, 0.45);

  // ---------- branches and canopy ----------
  const leafFrames: FrameInput[] = [];
  const branch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, bone: Joint, depth: number) => {
    const d = dir.clone().normalize();
    const sway = new THREE.Vector3(R() - 0.5, (R() - 0.5) * 0.3, R() - 0.5).multiplyScalar(len * 0.9);
    const pts = [
      start.clone(),
      start.clone().addScaledVector(d, len * 0.35).addScaledVector(sway, 0.3),
      start.clone().addScaledVector(d, len * 0.7).addScaledVector(sway, 0.8),
      start.clone().addScaledVector(d, len).addScaledVector(sway, 1.2).addScaledVector(up, len * 0.12),
    ];
    const sw = b.sweep(catmull(pts), [r, r * 0.3], {
      bone,
      color: depth > 0 ? BARK : TWIG,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: "branch",
    });
    if (depth > 0) {
      for (const k of [0.4, 0.65, 0.85]) {
        const at = sw.at(k, R() * 360);
        const cd = at.tangent
          .clone()
          .applyAxisAngle(up, (R() < 0.5 ? -1 : 1) * (0.7 + R() * 0.6))
          .addScaledVector(up, 0.3);
        branch(at.at.clone(), cd, len * 0.6, r * 0.5, bone, depth - 1);
      }
    }
    b.along(sw, depth > 0 ? 3 : 5, (a) => {
      leafFrames.push(a);
    });
    if (depth === 0)
      b.part(new THREE.IcosahedronGeometry(0.2 + R() * 0.12, 0), LEAFS[Math.floor(R() * LEAFS.length)], {
        bone,
        at: pts[3],
        flat: true,
        name: "canopy",
      });
  };
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    branch(
      new THREE.Vector3(Math.cos(a) * 0.3, 3.95, 0.35 + Math.sin(a) * 0.3),
      new THREE.Vector3(Math.cos(a) * 0.8, 1, Math.sin(a) * 0.8),
      1.1,
      0.09,
      head,
      1,
    );
  }
  for (const sb of shoulderBranches) {
    for (let k = 0; k < 4; k++) {
      branch(
        sb.pc.clone().add(new THREE.Vector3(sb.s * (k - 1.5) * 0.12, 0.35, (k - 1.5) * 0.15)),
        new THREE.Vector3(sb.s * 0.6, 1, (k - 1.5) * 0.4),
        0.9,
        0.07,
        sb.shoulder,
        1,
      );
    }
  }
  for (const x of [-0.6, -0.3, 0, 0.3, 0.6]) {
    branch(new THREE.Vector3(x, 2.7, -0.55), new THREE.Vector3(x * 1.2, 1, -0.5), 1.2, 0.1, chest, 1);
  }
  b.cards(leafFrames, leafTex, {
    size: [0.28, 0.36],
    lean: 50,
    bend: 20,
    vary: 0.3,
    spin: 180,
    rng: rng(70),
    flow: (_f, i) => [Math.cos(i * 2.4), 0.2, Math.sin(i * 2.4)],
  });

  return b.root;
}

const shoulderBranches: { pc: THREE.Vector3; s: number; shoulder: Joint }[] = [];
