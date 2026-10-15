import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mix, paint, scales } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { animeEye, cel } from "../../../../kits/toon";

export const meta = {
  name: "Phoenix",
  description:
    "A towering fire phoenix with wings spread, cel-shaded flame plumage, gold filigree collar and anklets, pyro halo and floating embers.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const DEEP = "#8c1228";
const RED = "#d4201f";
const ORANGE = "#ff7a1c";
const GOLD = "#ffc83a";
const CREAM = "#fff0b0";
const GOLDM = "#e9a82c";
const BEAK = "#ffcf4a";
const BEAKD = "#e08a1c";
const DARK = "#4a1428";

const fpaints = new Map<number, Paint>();
function featherPaint(L: number): Paint {
  const key = Math.round(L * 20);
  let p = fpaints.get(key);
  if (!p) {
    const len = key / 20 || 0.1;
    p = paint((_p, _n, s) => {
      const u = Math.min(Math.max(s[0] / len, 0), 1);
      const q = Math.round(u * 8) / 8;
      const c =
        q < 0.35
          ? mix(DEEP, RED, q / 0.35)
          : q < 0.65
            ? mix(RED, ORANGE, (q - 0.35) / 0.3)
            : q < 0.88
              ? mix(ORANGE, GOLD, (q - 0.65) / 0.23)
              : mix(GOLD, CREAM, (q - 0.88) / 0.12);
      const rachis = Math.abs(s[1]) < 0.005 && u > 0.05 && u < 0.92;
      return rachis ? mix(c, CREAM, 0.55) : c;
    });
    fpaints.set(key, p);
  }
  return p;
}

function outlineFor(L: number, w: number): OutlinePoint[] {
  return [
    [0, 0],
    [0.15 * L, w * 0.5],
    [0.5 * L, w * 0.55],
    [0.85 * L, w * 0.3],
    [L, 0, "sharp"],
    [0.85 * L, -w * 0.3],
    [0.5 * L, -w * 0.55],
    [0.15 * L, -w * 0.5],
  ];
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const up = new THREE.Vector3(0, 1, 0);

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.78, -0.25] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.25],
      [0, 0.92, 0.05],
      [0, 1.12, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.3],
      [0, 1.4, 0.5],
      [0, 1.68, 0.58],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.68, 0.58],
    dir: [0, 0.15, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.045 }),
    aim: head.local({ forward: 0.25, down: 0.055 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.25],
      [0, 0.72, -0.55],
      [0, 0.62, -0.9],
      [0, 0.5, -1.3],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- Body ----------
  const BODY = cel(countershade(RED, GOLD, { level: -0.2 }));
  const bodySw = b.sweep(spine, [0.2, 0.28, 0.26, 0.2], { color: BODY });
  const neckSw = b.sweep(neck, [0.16, 0.12, 0.09], { color: BODY });
  b.sweep(tail, [0.11, 0.03], { color: BODY });

  // Head
  const headC = head.local({ forward: 0.06 });
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), cel(countershade(ORANGE, CREAM, { level: -0.3 })), {
    bone: head,
    at: headC,
    scale: [0.1, 0.105, 0.12],
  });
  b.spike(
    head.local({ forward: 0.1 }),
    head.local({ forward: 0.32, down: 0.045 }),
    null,
    0.055,
    BEAK,
    { bone: head },
  );
  b.spike(jaw.at, head.local({ forward: 0.27, down: 0.065 }), null, 0.038, BEAKD, { bone: jaw });
  const EYE = animeEye({ iris: "#ff5a1a", blush: false });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(skull.at).at(s * 50, 8)!;
    b.decal(skin, EYE, { at: hit, size: [0.06, 0.082], mirror: s > 0 });
  }

  // Crest plumes
  const crestBase = head.local({ up: 0.1 });
  [-0.4, -0.2, 0, 0.2, 0.4].forEach((lat, i) => {
    const d = new THREE.Vector3(lat * 0.6, 0.55 + 0.25 * (i % 2), -1).normalize();
    const L = 0.34 + 0.12 * (i % 2) + 0.1 * (i === 2 ? 1 : 0);
    const y = up.clone().sub(d.clone().multiplyScalar(up.dot(d))).normalize();
    b.extrude(outlineFor(L, 0.075), {
      at: crestBase,
      x: d,
      y,
      thickness: 0.012,
      smoothing: 1,
      color: featherPaint(L),
      bone: head,
    });
  });

  // Gold collar, with chest medallion
  const collar = b.ring(neck.at(0.35), { count: 12, radius: 0.15 }).items;
  b.sweep(catmull(collar, { closed: true }), 0.02, GOLDM);
  const lower = b.ring(neck.at(0.2), { count: 12, radius: 0.17 }).items;
  b.sweep(catmull(lower, { closed: true }), 0.012, GOLD);
  const medal = b.surface(bodySw).ray([0, 1.05, 2], [0, 0, -1]);
  if (medal) {
    b.stick(new THREE.CylinderGeometry(0.075, 0.075, 0.025, 8), GOLDM, medal, { embed: 0.3 });
    glow(b.stick(new THREE.OctahedronGeometry(0.05), "#ff3b1a", medal, { embed: 0.2 }), 1.3);
  }

  // Flame cards on body and neck
  const flame = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#c8141e"/><stop offset=".5" stop-color="#ff7a1c"/><stop offset="1" stop-color="#ffd84a"/></linearGradient></defs><path d="M16 2 C20 18 30 30 28 46 C26 58 20 62 16 62 C12 62 6 58 4 46 C2 30 12 18 16 2Z" fill="url(#g)"/><path d="M16 22 C19 32 22 40 20 52 C18 58 14 58 12 52 C10 40 14 32 16 22Z" fill="#fff0b0" opacity=".85"/></svg>`,
    { size: 128 },
  );
  const bodyHits = b.surface(bodySw).scatter(130, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y > -0.4 });
  glow(
    b.cards(bodyHits, flame, { size: [0.07, 0.14], lean: 55, bend: 25, vary: 0.3, spin: 20, rng: rng(6) }),
    0.6,
  );
  const neckHits = b.surface(neckSw).scatter(50, { rng: rng(7), minDist: 0.06, filter: (h) => h.n.y > -0.3 });
  glow(
    b.cards(neckHits, flame, { size: [0.05, 0.1], lean: 55, bend: 25, vary: 0.3, spin: 20, rng: rng(8) }),
    0.6,
  );

  // ---------- Wings ----------
  const feather = (d: THREE.Vector3, at: THREE.Vector3, L: number, w: number, bone: Parameters<typeof b.part>[2] extends infer O ? (O extends { bone?: infer B } ? B : never) : never) => {
    const y = up.clone().cross(d).normalize();
    return b.extrude(outlineFor(L, w), {
      at,
      x: d,
      y,
      thickness: 0.012,
      smoothing: 1,
      color: featherPaint(L),
      bone,
    });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.2, 1.15, 0.1],
        [s * 0.75, 1.45, -0.05],
        [s * 1.3, 1.65, -0.15],
        [s * 1.62, 1.62, -0.25],
      ]),
      {
        parent: chest,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `handTip${S}`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.08, 0.03], { color: cel(countershade(RED, GOLD, { level: -0.1 })) });
    const wr = b.ring(wing.at(0.55), { count: 8, radius: 0.055 }).items;
    b.sweep(catmull(wr, { closed: true }), 0.014, GOLDM);

    const place = (t: number, row: number) => {
      const p = wing.at(t);
      const a = ((t < 0.5 ? 85 - ((t - 0.1) / 0.4) * 23 : 58 - ((t - 0.5) / 0.5) * 40) * Math.PI) / 180;
      const d = new THREE.Vector3(s * Math.cos(a), 0.1 + 0.05 * row, -Math.sin(a)).normalize();
      const L = (0.75 + 0.3 * Math.sin(Math.PI * (t - 0.1))) * 0.85 * [1, 0.58, 0.36][row];
      const at = new THREE.Vector3()
        .copy(p.at)
        .add(new THREE.Vector3(0, row ? 0.025 * row + 0.01 : 0, 0.05 * row));
      feather(d, at, L, [0.17, 0.14, 0.11][row], p.bone ?? undefined);
    };
    for (let i = 0; i < 9; i++) place(0.1 + (0.38 * i) / 8, 0);
    for (let i = 0; i < 9; i++) place(0.52 + (0.46 * i) / 8, 0);
    for (let row = 1; row <= 2; row++) for (let i = 0; i < 12; i++) place(0.1 + (0.88 * i) / 11, row);
  }

  // ---------- Tail feathers ----------
  const tailBone = tail.joints[1];
  const tailBase = new THREE.Vector3(0, 0.7, -0.45);
  const layers: Array<{ n: number; spread: number; L: number; w: number; drop: number; lift: number }> = [
    { n: 9, spread: 50, L: 1.2, w: 0.2, drop: 0.18, lift: 0 },
    { n: 7, spread: 36, L: 0.9, w: 0.17, drop: 0.12, lift: 0.04 },
    { n: 3, spread: 12, L: 1.9, w: 0.22, drop: 0.12, lift: 0.02 },
  ];
  for (const ly of layers) {
    for (let i = 0; i < ly.n; i++) {
      const a = ((ly.n === 1 ? 0 : -ly.spread + (2 * ly.spread * i) / (ly.n - 1)) * Math.PI) / 180;
      const d = new THREE.Vector3(Math.sin(a), -ly.drop, -Math.cos(a)).normalize();
      const L = ly.L * (0.8 + 0.2 * Math.cos(a * 1.6));
      feather(d, tailBase.clone().add(new THREE.Vector3(0, ly.lift, 0)), L, ly.w, tailBone);
    }
  }

  // ---------- Legs ----------
  const LEG = cel(scales(GOLDM, "#a8641a", { size: 0.035 }));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ankle: [number, number, number] = [s * 0.17, 0.16, 0.08];
    const pts = limb([s * 0.16, 0.72, -0.05], ankle, [0.33, 0.33], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, catmull(pts), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.075, 0.04], { color: LEG });
    const foot = leg.joints[leg.joints.length - 1];
    const an = b.ring(leg.at(0.85), { count: 8, radius: 0.058 }).items;
    b.sweep(catmull(an, { closed: true }), 0.012, GOLD);
    const toes: Array<[number, number]> = [
      [-0.09, 0.24],
      [0, 0.28],
      [0.09, 0.24],
      [0, -0.15],
    ];
    toes.forEach(([dx, dz], i) => {
      const tip: [number, number, number] = [ankle[0] + dx, 0.03, ankle[2] + dz];
      b.rod(ankle, tip, 0.028, GOLDM, { bone: foot, caps: "round", sides: 6 });
      const cd: [number, number, number] = [0, -0.4, dz > 0 ? 1 : -1];
      b.spike(tip, cd, 0.07, 0.022, DARK, { bone: foot, sides: 6 });
      void i;
    });
  }

  // ---------- Pyro halo and embers ----------
  const hc = new THREE.Vector3(0, 1.3, -1.0);
  glow(b.part(new THREE.TorusGeometry(0.8, 0.018, 6, 32), GOLD, { bone: hips, at: hc }), 1);
  glow(b.part(new THREE.TorusGeometry(0.66, 0.01, 5, 32), ORANGE, { bone: hips, at: hc }), 1);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    glow(
      b.part(new THREE.OctahedronGeometry(0.05), CREAM, {
        bone: hips,
        at: [0.8 * Math.cos(a), hc.y + 0.8 * Math.sin(a), hc.z],
        scale: [1, 1.5, 0.5],
        rotation: [0, 0, (a * 180) / Math.PI - 90],
      }),
      1.2,
    );
  }
  const r = rng(3);
  for (let k = 0; k < 16; k++) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.02 + 0.02 * r()), k % 2 ? GOLD : ORANGE, {
        bone: hips,
        at: [(r() * 2 - 1) * 1.8, 0.4 + r() * 1.5, -0.8 + r() * 1.6],
        rotation: [r() * 180, r() * 180, 0],
      }),
      1.2,
    );
  }

  return b.root;
}
