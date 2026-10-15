import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { countershade, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, furEdge, INK, shadowOf, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Phoenix",
  description:
    "A Genshin-style fire phoenix perched on a gold-rimmed rune plinth, wings spread, with layered cel-shaded flame feathers, a long flaring tail, gold filigree and a glowing ember gem.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const CRIM = "#d8222c";
const ORANGE = "#ff7a1f";
const GOLDY = "#ffc934";
const PALE = "#fff1a8";
const RIB = "#9c1220";
const GOLD = "#f6c84a";
const GOLD_D = "#c98a1c";
const TEAL = "#2fd6c8";

const LIGHT = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const shadowCache = new Map<string, readonly [number, number, number]>();
function toon(c: string, n: THREE.Vector3) {
  if (n.dot(LIGHT) > 0.1) return c;
  let s = shadowCache.get(c);
  if (!s) {
    s = shadowOf(c);
    shadowCache.set(c, s);
  }
  return s;
}

function flame(L: number) {
  return paint((_p, n, s) => {
    const f = s[0] / L + 0.1 * (zigzag(s[1] / 0.045) - 0.5);
    if (Math.abs(s[1]) < 0.005 && f > 0.05) return toon(RIB, n);
    return toon(f < 0.28 ? CRIM : f < 0.55 ? ORANGE : f < 0.82 ? GOLDY : PALE, n);
  });
}

function outline(L: number, w: number): OutlinePoint[] {
  return [
    [0, 0, "sharp"],
    [0.22 * L, w * 0.4],
    [0.6 * L, w * 0.5],
    [0.88 * L, w * 0.28],
    [L, 0, "sharp"],
    [0.88 * L, -w * 0.28],
    [0.6 * L, -w * 0.5],
    [0.22 * L, -w * 0.4],
  ];
}

const FEATHER = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
<stop offset="0" stop-color="#d8222c"/><stop offset="0.5" stop-color="#ff7a1f"/><stop offset="1" stop-color="#ffe27a"/></linearGradient></defs>
<path d="M20 78 C6 60 4 40 14 24 C16 18 18 10 20 2 C22 10 24 18 26 24 C36 40 34 60 20 78Z" fill="url(#g)"/>
<path d="M20 70 C16 52 18 30 20 12" stroke="#fff3b0" stroke-width="2.5" fill="none"/>
</svg>`,
  { size: 128 },
);

const RUNE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#ffd24a" stroke-width="2.6">
<circle cx="64" cy="64" r="60"/><circle cx="64" cy="64" r="52"/><circle cx="64" cy="64" r="30"/>
<path d="M64 14 L72 50 L108 64 L72 78 L64 114 L56 78 L20 64 L56 50 Z"/>
<path d="M64 34 L68 60 L94 64 L68 68 L64 94 L60 68 L34 64 L60 60 Z"/>
<g stroke-width="3"><path d="M64 4 V10 M64 118 V124 M4 64 H10 M118 64 H124 M21 21 L26 26 M107 21 L102 26 M21 107 L26 102 M107 107 L102 102"/></g>
</svg>`,
  { size: 256 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(11);

  const COAT = cel(furEdge(CRIM, GOLDY, { level: -0.2, teeth: 0.25, period: 0.05, ink: RIB }));
  const NECK = cel(furEdge(ORANGE, GOLDY, { level: -0.1, teeth: 0.25, period: 0.05, ink: RIB }));
  const HEADP = cel(countershade(ORANGE, GOLDY, { level: -0.1 }));
  const STONE = cel("#efe3c8", "#b9a48c");

  // ---- plinth
  const PZ = -0.2;
  b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.95, 0.04],
      [0.88, 0.07],
      [0.8, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, PZ], segments: 20, color: STONE },
  );
  b.part(new THREE.TorusGeometry(0.9, 0.02, 5, 28), GOLD, { at: [0, 0.075, PZ], dir: [0, 1, 0], axis: "z" });
  b.part(new THREE.TorusGeometry(0.96, 0.015, 5, 28), GOLD_D, { at: [0, 0.03, PZ], dir: [0, 1, 0], axis: "z" });
  glow(
    b.part(new THREE.PlaneGeometry(1.7, 1.7), "#ffffff", {
      at: [0, 0.103, PZ],
      dir: [0, 1, 0],
      axis: "z",
      texture: RUNE,
    }),
    1,
  );

  // ---- body
  const body = b.sweep(
    catmull([
      [0, 0.97, 0.36],
      [0, 1.0, 0.08],
      [0, 0.9, -0.3],
    ]),
    [0.17, 0.25, 0.14],
    COAT,
  );
  const neck = b.sweep(
    catmull([
      [0, 1.1, 0.3],
      [0, 1.35, 0.44],
      [0, 1.6, 0.52],
    ]),
    [0.14, 0.1, 0.085],
    NECK,
  );
  const HEAD_C = new THREE.Vector3(0, 1.72, 0.56);
  const head = b.part(new THREE.SphereGeometry(1, 10, 8), HEADP, { at: HEAD_C, scale: [0.12, 0.11, 0.13] });
  b.spike([0, 1.7, 0.66], [0, 1.63, 0.92], null, 0.055, GOLD);
  b.spike([0, 1.66, 0.67], [0, 1.61, 0.84], null, 0.036, GOLD_D);
  const EYE = animeEye({ iris: TEAL });
  const skin = b.surface(head);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 52, 8);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.06, 0.082], mirror: s > 0 });
  }
  b.part(new THREE.TorusGeometry(0.118, 0.012, 5, 14), GOLD, { at: [0, 1.77, 0.54], dir: [0, 1, -0.3], axis: "z" });
  b.part(new THREE.TorusGeometry(0.13, 0.02, 5, 14), GOLD, { at: [0, 1.3, 0.4], dir: [0, 0.9, 0.4], axis: "z" });
  b.part(new THREE.TorusGeometry(0.115, 0.014, 5, 14), GOLD_D, { at: [0, 1.17, 0.34], dir: [0, 0.9, 0.4], axis: "z" });

  // crest plumes
  for (const k of [-2, -1, 0, 1, 2]) {
    const L = 1 - Math.abs(k) * 0.15;
    b.sweep(
      catmull([
        [k * 0.035, 1.82, 0.52],
        [k * 0.07, 2.0 * 0.95 + 0.05, 0.3],
        [k * 0.13, 1.98 + 0.06 * L, 0.0],
      ]),
      [0.03, 0.004],
      { color: (t: number) => (t < 0.4 ? CRIM : t < 0.75 ? ORANGE : GOLDY), caps: "point" },
    );
  }

  // chest gem
  const chest = b.surface(body).ray([0, 1.0, 1.5], [0, 0, -1]);
  if (chest) {
    glow(b.stick(new THREE.OctahedronGeometry(0.055, 0), "#ffb43a", chest.moved([0, 0.02, 0])), 1.5);
    b.stick(new THREE.TorusGeometry(0.06, 0.012, 5, 10), GOLD, chest.moved([0, 0.012, 0]));
  }

  // breast & neck feather cards
  const cardHits = [
    ...b.surface(body).scatter(150, { rng: rand, minDist: 0.045, filter: (h) => h.n.y > -0.4 }),
    ...b.surface(neck).scatter(60, { rng: rand, minDist: 0.04 }),
  ];
  b.cards(cardHits, FEATHER, { size: [0.07, 0.13], lean: 62, bend: 25, vary: 0.3, rng: rand });

  // ---- legs
  for (const s of [1, -1]) {
    b.capsule([s * 0.12, 0.88, 0.0], [s * 0.13, 0.5, 0.12], 0.07, CRIM);
    b.rod([s * 0.13, 0.5, 0.12], [s * 0.13, 0.17, 0.1], [0.032, 0.026], GOLD_D);
    b.part(new THREE.TorusGeometry(0.04, 0.01, 5, 8), GOLD, { at: [s * 0.13, 0.3, 0.11], dir: [0, 1, 0], axis: "z" });
    for (const dx of [-0.07, 0, 0.07]) {
      const tip = new THREE.Vector3(s * 0.13 + dx, 0.125, 0.34);
      b.rod([s * 0.13, 0.15, 0.1], tip, 0.022, GOLD_D, { caps: "round" });
      b.spike(tip, [0, -0.03, 1], 0.07, 0.018, "#3a2418");
    }
    b.rod([s * 0.13, 0.15, 0.1], [s * 0.13, 0.125, -0.04], 0.02, GOLD_D);
    b.spike([s * 0.13, 0.125, -0.04], [0, -0.03, -1], 0.06, 0.016, "#3a2418");
    // thigh feather cards
    const th = b.surface(body).scatter(0);
    void th;
  }

  // ---- wings
  const Z = new THREE.Vector3(0, 0, 1);
  const ang = (28 * Math.PI) / 180;
  const ARM = 1.95;
  for (const s of [1, -1]) {
    const u = new THREE.Vector3(s * Math.cos(ang), Math.sin(ang), 0);
    const N = new THREE.Vector3().crossVectors(Z, u).multiplyScalar(s).normalize();
    const S0 = new THREE.Vector3(s * 0.2, 1.12, 0.05);
    const tipArm = S0.clone().addScaledVector(u, ARM);
    b.rod(S0, tipArm, [0.07, 0.03], cel("#c9242c"));
    b.part(new THREE.SphereGeometry(0.06, 6, 5), GOLD, { at: S0.clone().addScaledVector(u, ARM * 0.62) });
    b.spike(tipArm, u, 0.18, 0.03, GOLD_D);

    const feather = (t: number, phiDeg: number, L: number, w: number, off: number) => {
      const phi = (phiDeg * Math.PI) / 180;
      const root = S0.clone().addScaledVector(u, ARM * t).addScaledVector(N, off);
      const d = Z.clone().multiplyScalar(-Math.cos(phi)).addScaledVector(u, Math.sin(phi));
      const y = u.clone().multiplyScalar(Math.cos(phi)).addScaledVector(Z, Math.sin(phi));
      b.extrude(outline(L, w), {
        at: root,
        x: d,
        y,
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 1,
        color: flame(L),
      });
    };
    for (let i = 0; i < 9; i++) feather(0.3 + (0.7 * i) / 8, 20 + (62 * i) / 8, 1.2 - 0.5 * (i / 8) ** 2, 0.15, (i % 2) * 0.006);
    for (let i = 0; i < 8; i++) feather(0.04 + (0.3 * i) / 7, (14 * i) / 7, 0.95 - 0.03 * i, 0.17, 0.016 + (i % 2) * 0.006);
    for (let i = 0; i < 10; i++) feather(0.08 + (0.88 * i) / 9, 8 + (55 * i) / 9, 0.55 - 0.15 * (i / 9), 0.13, 0.034 + (i % 2) * 0.006);
    for (let i = 0; i < 9; i++) feather(0.12 + (0.8 * i) / 8, 12 + (50 * i) / 8, 0.32, 0.11, 0.052 + (i % 2) * 0.006);

    // leading-edge flames
    const frames: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 10; i++) {
      const p = S0.clone().addScaledVector(u, ARM * (0.1 + 0.09 * i)).addScaledVector(N, 0.07);
      frames.push(frame(p, N.clone().add(new THREE.Vector3(0, 0, 0.8))));
    }
    b.cards(frames, FEATHER, { size: [0.07, 0.17], lean: 20, bend: 20, vary: 0.25, rng: rand, flow: [s * 0.5, -0.2, -1] });
  }

  // ---- tail
  const TR = new THREE.Vector3(0, 0.84, -0.32);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = -4; i <= 4; i++) {
    const th = (i * 11 * Math.PI) / 180;
    const L = 1.75 - 0.5 * Math.abs(i / 4);
    const d = new THREE.Vector3(Math.sin(th), -0.38 - 0.05 * Math.abs(i), -Math.cos(th)).normalize();
    const y = new THREE.Vector3().crossVectors(d, up).normalize();
    b.extrude(outline(L, 0.22), {
      at: TR.clone().add(new THREE.Vector3(0, 0.014 * (i % 2) + 0.01, 0)),
      x: d,
      y,
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: flame(L),
    });
  }
  for (let i = -3; i <= 3; i++) {
    const th = (i * 14 * Math.PI) / 180;
    const L = 0.85;
    const d = new THREE.Vector3(Math.sin(th), -0.3, -Math.cos(th)).normalize();
    const y = new THREE.Vector3().crossVectors(d, up).normalize();
    b.extrude(outline(L, 0.2), {
      at: TR.clone().add(new THREE.Vector3(0, 0.05 + 0.006 * (i % 2), 0.02)),
      x: d,
      y,
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: flame(L),
    });
  }
  // gold streamers
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.08, 0.86, -0.34],
        [s * 0.35, 0.8, -1.0],
        [s * 0.5, 0.55, -1.6],
        [s * 0.38, 0.3, -2.1],
      ]),
      [0.022, 0.008],
      { color: (t: number) => (t < 0.7 ? GOLD : PALE), caps: "point" },
    );
  }

  // ---- floating embers
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    glow(
      b.part(new THREE.OctahedronGeometry(0.025 + 0.02 * rand(), 0), i % 3 ? "#ffd24a" : "#ff9a2e", {
        at: [side * (0.6 + 1.6 * rand()), 0.9 + 1.5 * rand(), -0.9 + 1.3 * rand()],
        rotation: [rand() * 90, rand() * 90, 0],
      }),
      1,
    );
  }
  void INK;

  return b.root;
}
