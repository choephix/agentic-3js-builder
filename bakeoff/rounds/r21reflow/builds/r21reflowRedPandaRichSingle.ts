import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { offset, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded, anime-eyed red panda standing four-legged on a moss-covered boulder, big ringed tail arched behind it, teal collar with a gold charm and dendro motes floating nearby.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// Palette (each cel gets a lit tone and a hue-shifted hard shadow tone)
const ORANGE = "#e0601f";
const RUST = "#b8401a";
const DARK = "#3a1e18";
const CREAM = "#fff1d6";
const TAN = "#f2c48a";
const TEAL = "#2fb8a8";
const GOLD = "#f2c14e";
const MOSS_L = "#8dc43c";
const MOSS_D = "#4f8a2a";
const GREY = "#8a8f94";
const GREY_L = "#aab0b3";
const TEAR = "#7a2410";
const EYEPATCH = "#8a3016";
const CLAW = "#f6e6c8";

const HC = new THREE.Vector3(0, 0.625, 0.3);

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, 0.49, -0.17] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.49, -0.17],
      [0, 0.5, -0.04],
      [0, 0.515, 0.08],
      [0, 0.53, 0.19],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.53, 0.19],
      [0, 0.57, 0.24],
      [0, 0.6, 0.27],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.6, 0.27], dir: [0, 0.4, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.598, 0.335], aim: [0, 0.585, 0.41], role: "jaw" });
  const base = b.joint("base", { parent: hips, at: [0, 0.2, 0], dir: [0, 1, 0] });

  const tailPath = catmull([
    [0, 0.5, -0.21],
    [0, 0.52, -0.31],
    [0, 0.6, -0.41],
    [0, 0.73, -0.45],
    [0, 0.85, -0.4],
    [0, 0.92, -0.32],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });

  // ---------------- paints ----------------
  const bodyCoat = cel(furEdge(ORANGE, DARK, { level: -0.25, teeth: 0.3, period: 0.035 }));
  const neckCoat = cel(furEdge(ORANGE, CREAM, { level: -0.2, teeth: 0.25, period: 0.03 }));
  const legCoat = cel(
    furEdge(ORANGE, DARK, { by: "position", axis: [0, 1, 0], level: 0.42, teeth: 0.03, period: 0.03 }),
  );
  const tailCoat = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.95) return DARK;
      if (t < 0.1) return RUST;
      const q = (t - 0.1) / 0.095 + 0.35 * (zigzag(s[1] / 40) - 0.5);
      const k = Math.floor(q);
      return ((k % 2) + 2) % 2 === 0 ? RUST : TAN;
    }),
  );
  const faceCoat = cel(
    paint((p, _n) => {
      const u = Math.abs(p.x);
      const v = p.y - HC.y;
      const w = p.z - HC.z;
      const zz = zigzag(u / 0.014);
      if (w > 0.01 && v < 0.004 && v > -0.045 && Math.abs(u - (0.034 - v * 0.15)) < 0.0055) return TEAR;
      const bx = (u - 0.036) / 0.018;
      const by = (v - 0.034) / 0.011;
      if (w > 0 && bx * bx + by * by < 1) return CREAM;
      const ex = (u - 0.034) / 0.022;
      const ey = (v - 0.002) / 0.022;
      if (w > 0 && ex * ex + ey * ey < 1) return EYEPATCH;
      if (w > -0.02 && v < -0.014 + 0.012 * zz) return CREAM;
      if (u > 0.05 && v < 0.025 + 0.01 * zz && w > -0.04) return CREAM;
      return v > 0.045 ? RUST : ORANGE;
    }),
  );
  const stoneCoat = cel(
    paint((p, n) => {
      const nz = noise(p, 0.08, 3);
      const moss = smoothstep(0.35, 0.6, n.y * 0.55 + nz * 0.7 + (p.y - 0.15) * 1.2 - 0.15);
      if (moss > 0.5) return nz > 0.55 ? MOSS_L : MOSS_D;
      return noise(p, 0.05, 9) > 0.55 ? GREY_L : GREY;
    }),
  );

  // ---------------- stone ----------------
  const rock: THREE.Vector2[] = [
    [0, 0],
    [0.24, 0],
    [0.3, 0.06],
    [0.31, 0.15],
    [0.29, 0.25],
    [0.24, 0.3],
    [0.16, 0.322],
    [0, 0.33],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const stoneParts = [
    b.part(new THREE.LatheGeometry(rock, 10), stoneCoat, {
      bone: base,
      at: [0, 0, 0],
      scale: [1, 1, 0.85],
      flat: true,
      name: "stone",
    }),
  ];
  const r4 = rng(4);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r4() * 0.4;
    const sz = 0.05 + r4() * 0.03;
    stoneParts.push(
      b.part(new THREE.IcosahedronGeometry(1, 0), stoneCoat, {
        bone: base,
        at: [Math.cos(a) * 0.27, sz * 0.9, Math.sin(a) * 0.23],
        scale: [sz * 1.1, sz * 0.9, sz],
        rotation: [r4() * 60, r4() * 360, r4() * 60],
        flat: true,
        name: `lump${i}`,
      }),
    );
  }
  const stoneSkin = b.surface(stoneParts);
  const mossTex = svg(
    `<svg viewBox="0 0 64 48"><g fill="#fff"><circle cx="14" cy="36" r="12"/><circle cx="32" cy="28" r="16"/><circle cx="50" cy="36" r="13"/><circle cx="24" cy="18" r="9"/><circle cx="42" cy="16" r="8"/></g><rect x="0" y="40" width="64" height="8" fill="#fff"/></svg>`,
    { size: 128 },
  );
  const mossHits = stoneSkin.scatter(80, { rng: rng(21), minDist: 0.03, filter: (h) => h.n.y > 0.35 });
  const mossA = mossHits.filter((_, i) => i % 2 === 0);
  const mossB = mossHits.filter((_, i) => i % 2 === 1);
  const mossFlow = (_f: unknown, i: number) => [Math.cos(i * 2.1), 0, Math.sin(i * 2.1)];
  b.cards(mossA, mossTex, { size: 0.055, lean: 15, flow: mossFlow, cross: true, vary: 0.3, rng: rng(22), color: "#6fa32a" });
  b.cards(mossB, mossTex, { size: 0.045, lean: 15, flow: mossFlow, cross: true, vary: 0.3, rng: rng(23), color: "#a6cf45" });
  for (const hit of mossHits.slice(0, 18))
    b.stick(new THREE.SphereGeometry(0.03, 6, 4), MOSS_L, hit, { embed: 0.5, scale: [1, 0.45, 1], flat: true });

  // little mushrooms on the stone's shoulder
  for (const [mx, mz, sc] of [
    [0.19, 0.1, 1],
    [0.22, 0.04, 0.7],
    [-0.2, 0.12, 0.85],
  ]) {
    b.part(new THREE.CylinderGeometry(0.004 * sc, 0.005 * sc, 0.04 * sc, 6), CREAM, {
      bone: base,
      at: [mx, 0.31 + 0.02 * sc, mz],
    });
    b.part(new THREE.SphereGeometry(0.02 * sc, 8, 5), "#e0503c", {
      bone: base,
      at: [mx, 0.335 + 0.03 * sc, mz],
      scale: [1, 0.6, 1],
    });
    b.part(new THREE.SphereGeometry(0.004 * sc, 5, 4), CREAM, {
      bone: base,
      at: [mx + 0.008 * sc, 0.35 + 0.03 * sc, mz + 0.006 * sc],
    });
  }

  // ---------------- body ----------------
  const body = b.sweep(spine, [0.07, 0.088, 0.092, 0.082], { color: bodyCoat, name: "body" });
  const neckTube = b.sweep(neck, [0.08, 0.066, 0.06], { color: neckCoat, name: "neckTube" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 7), bodyCoat, {
      bone: hips,
      at: [s * 0.075, 0.47, -0.17],
      scale: [0.05, 0.062, 0.07],
    });
    b.part(new THREE.SphereGeometry(1, 10, 7), bodyCoat, {
      bone: spine.joints[2],
      at: [s * 0.075, 0.47, 0.15],
      scale: [0.045, 0.05, 0.06],
    });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), cel(CREAM), {
    bone: spine.joints[2],
    at: [0, 0.505, 0.235],
    scale: [0.05, 0.065, 0.038],
    name: "bib",
  });

  // fur tufts
  const tuft = svg(`<svg viewBox="0 0 32 64"><path d="M4 64 Q10 30 16 0 Q22 30 28 64 Z" fill="#fff"/></svg>`, {
    size: 64,
  });
  const bodyHits = b.surface(body).scatter(130, { rng: rng(11), minDist: 0.025, filter: (h) => h.n.y > -0.1 });
  b.cards(bodyHits, tuft, { size: [0.03, 0.05], lean: 60, bend: 20, vary: 0.3, rng: rng(12), color: "#d4561d" });
  const neckHits = b.surface(neckTube).scatter(30, { rng: rng(13), minDist: 0.025, filter: (h) => h.n.y < 0.2 });
  b.cards(neckHits, tuft, { size: [0.028, 0.045], lean: 60, bend: 20, vary: 0.3, rng: rng(14), color: "#fff1d6" });

  // ---------------- tail ----------------
  const tailTube = b.sweep(tail, [0.035, 0.06, 0.075, 0.075, 0.062, 0.02], { color: tailCoat, name: "tailTube" });
  const tailHits = b.surface(tailTube).scatter(90, { rng: rng(31), minDist: 0.03 });
  const tailRust: typeof tailHits = [];
  const tailTan: typeof tailHits = [];
  for (const h of tailHits) {
    const t = tailPath.closestT(h.at);
    if (t > 0.95) continue;
    const k = Math.floor((t - 0.1) / 0.095);
    (t < 0.1 || ((k % 2) + 2) % 2 === 0 ? tailRust : tailTan).push(h);
  }
  b.cards(tailRust, tuft, { size: [0.035, 0.06], lean: 55, bend: 25, vary: 0.3, rng: rng(32), color: "#c8481b" });
  b.cards(tailTan, tuft, { size: [0.035, 0.06], lean: 55, bend: 25, vary: 0.3, rng: rng(33), color: "#f0c48a" });
  // gold band at the tail root
  b.sweep(b.surface(tailTube).loop(tail.at(0.18), { lift: 0.004 }), 0.006, { color: GOLD, name: "tailBand" });

  // ---------------- legs ----------------
  const pawFor = (s: number, joint: ReturnType<typeof b.joint>, cx: number, cz: number, big: number) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
      bone: joint,
      at: [cx, 0.33, cz],
      scale: [0.032 * big, 0.022, 0.042 * big],
    });
    for (const i of [-1, 0, 1]) {
      const tx = cx + i * 0.013 * big;
      b.part(new THREE.SphereGeometry(0.011 * big, 6, 4), DARK, { bone: joint, at: [tx, 0.324, cz + 0.04 * big] });
      b.spike([tx, 0.322, cz + 0.05 * big], [i * 0.15, -0.5, 1], 0.02, {
        radius: 0.0045,
        color: CLAW,
        bone: joint,
        sides: 4,
      });
    }
    void s;
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fp = limb([s * 0.07, 0.45, 0.15], [s * 0.07, 0.328, 0.17], [0.075, 0.075], [0, 0, -1]);
    const fl = b.chain(`legF${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.036, 0.03, 0.027], { color: legCoat, name: `armTube${side}` });
    pawFor(s, fl.tip ?? fl.joints[fl.joints.length - 1], s * 0.07, 0.185, 1);

    const hp = limb([s * 0.07, 0.455, -0.17], [s * 0.07, 0.328, -0.17], [0.085, 0.085], [0, 0, 1]);
    const hl = b.chain(`legH${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.052, 0.036, 0.03], { color: legCoat, name: `legTube${side}` });
    pawFor(s, hl.tip ?? hl.joints[hl.joints.length - 1], s * 0.07, -0.155, 1.15);
  }

  // ---------------- head ----------------
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), faceCoat, {
    bone: head,
    at: HC,
    scale: [0.075, 0.065, 0.07],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), cel(CREAM), {
    bone: head,
    at: [0, 0.607, 0.365],
    scale: [0.032, 0.027, 0.04],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), cel(CREAM), {
    bone: jaw,
    at: [0, 0.592, 0.368],
    scale: [0.026, 0.014, 0.036],
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(0.013, 8, 6), INK, {
    bone: head,
    at: [0, 0.614, 0.402],
    scale: [1.2, 0.85, 0.9],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.003, 5, 4), "#ffffff", { bone: head, at: [-0.003, 0.619, 0.411] });

  const EYE = animeEye({ iris: "#d9741c", blush: "#ff9a8a" });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 32, 12);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.038, 0.052], mirror: s > 0 });
  }

  for (const s of [1, -1]) {
    // ears: dark outer, cream inner, cream tufts
    const ear = [
      [-0.026, 0],
      [0.026, 0],
      [0.03, 0.042],
      [0, 0.075, "sharp"],
      [-0.03, 0.042],
    ] as Array<[number, number] | [number, number, "sharp"]>;
    const earIn = [
      [-0.016, 0.004],
      [0.016, 0.004],
      [0.019, 0.034],
      [0, 0.058, "sharp"],
      [-0.019, 0.034],
    ] as Array<[number, number] | [number, number, "sharp"]>;
    b.extrude(ear, {
      at: [s * 0.052, 0.672, 0.295],
      x: [s, 0, 0],
      y: [s * 0.4, 1, 0],
      thickness: 0.014,
      bevel: 0.003,
      smoothing: 1,
      color: cel("#7a2a14"),
      bone: head,
      name: `ear${s > 0 ? "L" : "R"}`,
    });
    b.extrude(earIn, {
      at: [s * 0.052, 0.674, 0.3],
      x: [s, 0, 0],
      y: [s * 0.4, 1, 0],
      thickness: 0.008,
      bevel: 0.002,
      smoothing: 1,
      color: cel(CREAM),
      bone: head,
      name: `earInner${s > 0 ? "L" : "R"}`,
    });
    for (const k of [0, 1, 2])
      b.spike([s * (0.068 + k * 0.004), 0.688 + k * 0.004, 0.295], [s * 0.8, 0.5, 0.1], 0.03, {
        radius: 0.01,
        color: CREAM,
        bone: head,
        sides: 5,
      });
    // cheek ruff
    for (const [cy, cz] of [
      [0.615, 0.32],
      [0.6, 0.315],
      [0.588, 0.325],
    ])
      b.spike([s * 0.068, cy, cz], [s * 0.8, -0.3, -0.4], 0.04, {
        radius: 0.017,
        color: CREAM,
        bone: head,
        sides: 5,
      });
    // whiskers
    for (const dy of [0.015, 0, -0.015])
      b.rod([s * 0.03, 0.603, 0.39], [s * 0.115, 0.603 + dy * 1.6, 0.385], 0.0014, {
        color: "#fff6e8",
        bone: head,
        sides: 4,
      });
  }
  // crown tufts
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.022;
    b.spike([x, 0.685, 0.3 + (i % 2) * 0.02], [x * 3, 1, 0.3], 0.03, {
      radius: 0.012,
      color: RUST,
      bone: head,
      sides: 5,
    });
  }

  // ---------------- Genshin touches: teal collar, gold charm, dendro motes ----------------
  b.sweep(b.surface(neckTube).loop(neck.at(0.45), { lift: 0.006 }), 0.007, { color: TEAL, name: "collar" });
  const charm = b.surface(neckTube).around(neck.at(0.45).at).at(0, -35);
  if (charm) {
    b.stick(new THREE.CylinderGeometry(0.016, 0.016, 0.006, 10), GOLD, charm, { embed: 0.3 });
    glow(b.stick(new THREE.SphereGeometry(0.008, 6, 4), "#7df0d0", charm.moved([0, 0.004, 0]), { embed: 0.2 }), 1.2);
    for (const dx of [-0.008, 0.008]) {
      const a = charm.at.clone().add(new THREE.Vector3(dx, -0.012, 0.004));
      b.rod(a, offset(a, [dx * 4, -1, 0.3], 0.05), 0.0028, { color: TEAL, bone: neck.joints[1], sides: 4 });
      b.part(new THREE.SphereGeometry(0.007, 6, 4), GOLD, {
        bone: neck.joints[1],
        at: offset(a, [dx * 4, -1, 0.3], 0.055),
      });
    }
  }
  const motes: Array<[number, number, number]> = [
    [0.28, 0.62, 0.18],
    [-0.3, 0.52, 0.25],
    [0.24, 0.82, -0.2],
    [-0.26, 0.78, -0.12],
    [0.12, 0.8, 0.28],
  ];
  motes.forEach((m, i) => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.012 + (i % 2) * 0.005, 0), "#9fe870", {
        bone: base,
        at: m,
        rotation: [i * 30, i * 50, i * 20],
      }),
      1.4,
    );
  });

  return b.root;
}
