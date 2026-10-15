import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { mix, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description: "Cel-shaded fire phoenix standing with wings spread, flame feathers, gold filigree rings and tassels.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const RED = cel("#d92b1f");
const ORG = cel("#ff7b1c");
const YEL = cel("#ffd445");
const GOLDP = cel("#f2b83a", "#b8741a");
const GOLD = "#f2b92f";
const DGOLD = "#9a5f18";
const CLAW = "#4a1d12";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const featherCache = new Map<string, ReturnType<typeof cel>>();
function featherPaint(L: number) {
  const Lr = Math.round(L * 10) / 10;
  const key = Lr.toFixed(1);
  let p = featherCache.get(key);
  if (!p) {
    p = cel(
      paint((_p, _n, s) => {
        const u = Math.min(1, Math.max(0, s[0] / Lr));
        if (Math.abs(s[1]) < 0.004 && u > 0.04 && u < 0.9) return "#ffe9a0";
        return u < 0.45 ? mix("#c91f1f", "#ff7b1c", u / 0.45) : mix("#ff7b1c", "#ffd445", (u - 0.45) / 0.55);
      }),
    );
    featherCache.set(key, p);
  }
  return p;
}

function featherOutline(L: number, w: number): OutlinePoint[] {
  return [
    [0, -w * 0.35],
    [L * 0.25, -w],
    [L * 0.7, -w * 0.8],
    [L, 0, "sharp"],
    [L * 0.7, w * 0.8],
    [L * 0.25, w],
    [0, w * 0.35],
  ];
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(7);

  function feather(at: THREE.Vector3, d: THREE.Vector3, L: number, w: number, lift: number) {
    const dn = d.clone().normalize();
    const y = V(0, 1, 0).cross(dn).normalize();
    b.extrude(featherOutline(L, w), {
      at: at.clone().add(V(0, lift, 0)),
      x: dn,
      y,
      thickness: 0.012,
      smoothing: 1,
      color: featherPaint(L),
    });
  }

  function flame(base: THREE.Vector3, d: THREE.Vector3, len: number, w: number, color: string, k = 1.2) {
    const dn = d.clone().normalize();
    const ref = Math.abs(dn.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0);
    const x = ref.clone().cross(dn).normalize();
    glow(
      b.extrude(
        [
          [0, 0],
          [w, len * 0.25],
          [w * 0.55, len * 0.6],
          [w * 0.8, len, "sharp"],
          [-w * 0.5, len * 0.55],
          [-w, len * 0.22],
        ],
        { at: base, x, y: dn, thickness: 0.01, smoothing: 1, color },
      ),
      k,
    );
  }

  function ring(at: THREE.Vector3, dir: THREE.Vector3, r: number, tube: number) {
    return b.part(new THREE.TorusGeometry(r, tube, 6, 14), GOLD, { at, dir, axis: "z" });
  }

  // ---- textures
  const featherCard = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d92b1f"/><stop offset="0.5" stop-color="#ff8a22"/><stop offset="1" stop-color="#ffd445"/></linearGradient></defs><path d="M16 63 C3 48 3 22 16 1 C29 22 29 48 16 63Z" fill="url(#g)" stroke="#a8300f" stroke-width="2"/><path d="M16 60 L16 8" stroke="#ffe9a0" stroke-width="2.4"/></svg>`,
    { size: 128 },
  );
  const tassel = svg(
    `<svg viewBox="0 0 16 48"><path d="M2 40 L5 6 L8 40Z M6 40 L8 2 L10 40Z M8 40 L11 6 L14 40Z" fill="#d92b1f" stroke="#7a1410" stroke-width="1.2"/><rect x="3" y="38" width="10" height="5" fill="#f2b92f" stroke="#9a5f18" stroke-width="1"/><circle cx="8" cy="45.5" r="2.4" fill="#f2b92f" stroke="#9a5f18" stroke-width="0.8"/></svg>`,
    { size: 128 },
  );
  const EYE = animeEye({ iris: "#ffb21c", irisLight: "#fff08a", blush: "#ff8a5a" });

  // ---- body
  const coat = furEdge(RED, YEL, { level: -0.25, teeth: 0.25, period: 0.05, ink: "#7a2410" });
  const body = b.sweep(
    catmull([
      [0, 0.95, -0.5],
      [0, 0.97, -0.05],
      [0, 1.06, 0.3],
    ]),
    [0.08, 0.2, 0.2, 0.14],
    coat,
  );
  const neckPath = catmull([
    [0, 1.12, 0.28],
    [0, 1.3, 0.42],
    [0, 1.5, 0.46],
    [0, 1.6, 0.5],
  ]);
  const neck = b.sweep(neckPath, [0.15, 0.1, 0.075, 0.07], furEdge(RED, YEL, { level: -0.3, teeth: 0.25, period: 0.04 }));

  // chest and neck feather cards
  const bodyHits = b.surface(body).scatter(130, { rng: rng(3), minDist: 0.07 });
  b.cards(bodyHits, featherCard, { size: [0.1, 0.17], lean: 55, bend: 20, vary: 0.25, rng: rng(4), flow: [0, -0.3, -1] });
  const neckHits = b.surface(neck).scatter(40, { rng: rng(5), minDist: 0.06 });
  b.cards(neckHits, featherCard, { size: [0.07, 0.12], lean: 60, vary: 0.2, rng: rng(6), flow: [0, -0.3, -1] });

  // collar and chest gem
  const cp = neck.at(0.3);
  ring(cp, cp.tangent, cp.radius + 0.01, 0.022);
  const gemHit = b.surface(body).ray([0, 1.1, 1], [0, 0, -1])!;
  b.stick(new THREE.OctahedronGeometry(0.05, 0), GOLD, gemHit);
  glow(b.stick(new THREE.OctahedronGeometry(0.034, 0), "#ff3a2a", gemHit.moved([0, 0.03, 0]) as never), 1.5);

  // ---- head
  const HEAD_C: [number, number, number] = [0, 1.62, 0.52];
  const head = b.part(new THREE.SphereGeometry(1, 12, 9), cel(furEdge(ORG, YEL, { by: "position", axis: [0, 1, 0], level: 1.6, teeth: 0.015, period: 0.03, along: [1, 0, 0] })), {
    at: HEAD_C,
    scale: [0.095, 0.085, 0.115],
  });
  const skin = b.surface(head);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 52, 6)!;
    b.decal(skin, EYE, { at: hit, size: [0.048, 0.066], mirror: s > 0 });
  }
  const fh = skin.around(HEAD_C).at(0, 38)!;
  b.stick(new THREE.OctahedronGeometry(0.026, 0), GOLD, fh);
  glow(b.stick(new THREE.OctahedronGeometry(0.016, 0), "#ff3a2a", fh.moved([0, 0.018, 0]) as never), 1.5);

  b.spike([0, 1.62, 0.6], [0, -0.35, 1], 0.2, 0.05, "#f6c244");
  b.spike([0, 1.585, 0.6], [0, -0.05, 1], 0.13, 0.035, "#e09a2a");

  // crest flames
  const crest: Array<[number, number, number, number, string]> = [
    [0, 0.6, -0.8, 0.42, "#ffd84a"],
    [0.07, 0.5, -0.85, 0.34, "#ffb02e"],
    [-0.07, 0.5, -0.85, 0.34, "#ffb02e"],
    [0.13, 0.35, -0.9, 0.26, "#ff7a1a"],
    [-0.13, 0.35, -0.9, 0.26, "#ff7a1a"],
  ];
  for (const [dx, dy, dz, len, col] of crest) flame(V(dx * 0.3, 1.7, 0.47), V(dx, dy, dz), len, 0.05, col, 1.2);
  // cheek plumes
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) feather(V(s * 0.07, 1.6 - i * 0.015, 0.45), V(s * (0.5 + i * 0.25), 0.15 - i * 0.12, -1), 0.28 - i * 0.04, 0.035, i * 0.012);

  // ---- legs
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), RED, { at: [s * 0.15, 0.85, 0.0], scale: [0.1, 0.14, 0.14] });
    const legP = catmull([
      [s * 0.13, 0.85, 0.0],
      [s * 0.15, 0.62, 0.17],
      [s * 0.13, 0.28, -0.04],
      [s * 0.12, 0.045, 0.1],
    ]);
    b.sweep(legP, [0.05, 0.036, 0.03, 0.034], scales(["#f2b83a", "#ffcf55"], "#8a5410", { size: 0.03 }));
    const ap = legP.at(0.72);
    ring(ap, legP.tangentAt(0.72), 0.045, 0.014);
    b.cards([frame(ap.clone().add(V(0, -0.04, 0.0)), [0, 1, 0])], tassel, { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1] });
    const F = V(s * 0.12, 0.04, 0.1);
    for (const a of [-28, 0, 28]) {
      const r = (a * Math.PI) / 180;
      const d = V(Math.sin(r), -0.06, Math.cos(r));
      b.spike(F, d, 0.2, 0.024, "#e8a931");
      b.spike(F.clone().add(d.clone().multiplyScalar(0.19)), d.clone().add(V(0, -0.35, 0)), 0.08, 0.017, CLAW);
    }
    b.spike(F, [0, -0.05, -1], 0.13, 0.022, "#e8a931");
    b.spike(F.clone().add(V(0, 0, -0.12)), [0, -0.3, -1], 0.06, 0.015, CLAW);
  }

  // ---- wings
  const dirAt = (s: number, t: number, a0: number, a1: number, lowY: number) => {
    const a = ((a0 + (a1 - a0) * t) * Math.PI) / 180;
    return V(s * Math.sin(a), lowY * (1 - t) + 0.05, -Math.cos(a));
  };
  for (const s of [1, -1]) {
    const sh = [s * 0.16, 1.12, 0.08];
    const el = [s * 0.75, 1.55, -0.05];
    const wr = [s * 1.3, 1.8, -0.02];
    const armP = catmull([sh, el, wr]);
    b.part(new THREE.SphereGeometry(1, 10, 8), RED, { at: sh, scale: 0.14 });
    b.sweep(armP, [0.1, 0.065, 0.04], RED);
    const wrV = V(wr[0]!, wr[1]!, wr[2]!);

    // secondaries
    const nS = 10;
    for (let i = 0; i < nS; i++) {
      const t = 0.02 + (0.93 * i) / (nS - 1);
      feather(armP.at(t), dirAt(s, t, 5, 70, -0.18), 0.95 - 0.25 * t, 0.085, (i % 2) * 0.01);
    }
    // primaries
    const nP = 9;
    for (let i = 0; i < nP; i++) {
      const k = i / (nP - 1);
      const L = 0.95 + 0.35 * Math.sin(Math.PI * (0.15 + 0.75 * k));
      const d = dirAt(s, k, 70, 104, 0);
      d.y += 0.1;
      feather(wrV, d, L, 0.075, (i % 2) * 0.01);
      const tip = wrV.clone().add(d.clone().normalize().multiplyScalar(L * 0.93));
      flame(tip, d.clone().add(V(0, 0.5, 0)), 0.26, 0.042, i % 2 ? "#ffb02e" : "#ffd84a", 1.2);
    }
    // coverts rows
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      feather(armP.at(t), dirAt(s, t, 5, 70, -0.18), 0.5, 0.07, 0.03);
      feather(armP.at(t), dirAt(s, t, 8, 72, -0.1), 0.26, 0.05, 0.055);
    }
    for (let i = 0; i < 6; i++) {
      const k = i / 5;
      feather(wrV, dirAt(s, k, 70, 100, 0.05), 0.45, 0.06, 0.03);
    }
    // secondary tip flames
    for (let i = 1; i < nS; i += 3) {
      const t = 0.02 + (0.93 * i) / (nS - 1);
      const d = dirAt(s, t, 5, 70, -0.18);
      const tip = armP.at(t).add(d.clone().normalize().multiplyScalar((0.95 - 0.25 * t) * 0.92));
      flame(tip, d.clone().add(V(0, 0.5, 0)), 0.2, 0.04, "#ff9a24", 1.1);
    }
    // gold rings and tassels
    const pe = armP.at(0.5);
    ring(pe, armP.tangentAt(0.5), 0.075, 0.02);
    const pw = armP.at(0.93);
    ring(pw, armP.tangentAt(0.93), 0.05, 0.017);
    b.cards([frame(pw.clone().add(V(0, -0.045, 0)), [0, 1, 0])], tassel, { size: [0.07, 0.3], lean: 180, flow: [0, 0, 1] });
    b.cards([frame(pe.clone().add(V(0, -0.07, 0)), [0, 1, 0])], tassel, { size: [0.06, 0.24], lean: 180, flow: [0, 0, 1] });
    b.part(new THREE.OctahedronGeometry(0.035, 0), GOLD, { at: pw.clone().add(V(0, 0.05, 0.0)) });
  }

  // ---- tail plumes
  const tailBase = [0, 0.93, -0.5];
  for (let k = -3; k <= 3; k++) {
    const a = Math.abs(k);
    const endZ = -2.7 + 0.25 * a;
    const w = 0.07 + 0.02 * (3 - a) / 3;
    const path = catmull([
      tailBase,
      [k * 0.1, 0.88, -0.9],
      [k * 0.28 + 0.05 * Math.sin(k), 0.5, -1.5],
      [k * 0.45, 0.2, (endZ - 1.5) * 0.55 - 0.6],
      [k * 0.55, 0.08, endZ],
    ]);
    b.sweep(path, (t) => [w * (1 - 0.75 * t) + 0.006, 0.007], {
      bands: [
        [0.4, RED],
        [0.75, ORG],
        [1, YEL],
      ],
      caps: { start: "flat", end: "point" },
    });
    const tip = path.at(0.97);
    flame(tip, V(0, 0.8, -0.5), 0.2, 0.04, a % 2 ? "#ffb02e" : "#ffd84a", 1.2);
  }
  // tail-base ornament
  ring(V(0, 0.93, -0.5), V(0, 0.02, -1), 0.085, 0.02);
  for (let i = 0; i < 5; i++) {
    const t = (i - 2) * 0.17;
    feather(V(Math.sin(t) * 0.12, 1.02, -0.45), V(Math.sin(t) * 0.6, 0.35, -1), 0.4, 0.06, 0.01 * i);
  }

  // embers
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 3.6;
    const y = 0.3 + R() * 1.9;
    const z = (R() - 0.5) * 2.4;
    glow(b.part(new THREE.OctahedronGeometry(0.015 + R() * 0.015, 0), i % 2 ? "#ffd84a" : "#ff8a22", { at: [x, y, z] }), 1.3);
  }

  return b.root;
}
