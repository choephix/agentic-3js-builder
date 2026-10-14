import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, countershade, rng, vec } from "../../../../src/index";

export const meta = {
  name: "Moss Stag Spirit",
  description:
    "A small forest spirit: river-stone body cloaked in moss, slender wooden legs with hooves, a pale wooden mask face with glowing green eyes, flowering antlers and circling fireflies.",
};

const WOOD = "#d9c7a0";
const WOOD_DARK = "#8a6a45";
const BARK = "#6b4f33";
const ANTLER = "#b89a6a";
const DARK = "#3a2a1c";
const GLOW = "#7dff6a";
const WHITE = "#fbfbf2";
const YELLOW = "#f6d84a";
const LEAF = "#4f9a3a";
const LEAF2 = "#6fb84a";
const FLY = "#eaff7a";
const HOOF = "#3b2f28";
const STONE = "#8a8e94";

export default function build() {
  const b = createBuilder({ name: "mossSpirit" });
  const rand = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.66, -0.25], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.25],
      [0, 0.67, 0.0],
      [0, 0.69, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.72, 0.22],
      [0, 0.86, 0.32],
      [0, 1.0, 0.4],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const neckEnd = neck.at(1).at;
  const head = b.joint("head", { parent: neck.joints[1], at: neckEnd, dir: [0, -0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.03 }),
    aim: head.local({ forward: 0.2, down: 0.04 }),
    role: "jaw",
  });

  // ---------- body ----------
  const moss = mottle("#58953a", "#82c250", { size: 0.07, seed: 3 });
  const stone = mottle("#80848c", "#5d626a", { size: 0.06, seed: 2 });
  const coat = countershade(moss, stone, { level: -0.15 });
  const body = b.sweep(spine, (t) => [0.15 + 0.03 * Math.sin(Math.PI * t), 0.16 + 0.02 * Math.sin(Math.PI * t)], {
    color: coat,
    sides: 10,
  });
  b.sweep(neck, [0.07, 0.045], { color: WOOD_DARK, sides: 6 });

  const skin = b.surface(body);
  const greens = [LEAF, LEAF2, "#3f8030"];
  skin.scatter(46, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y > 0.05 }).forEach((h, i) => {
    const r = 0.025 + rand() * 0.03;
    b.stick(new THREE.IcosahedronGeometry(r, 0), greens[i % 3], h, { embed: 0.35, flat: true });
  });
  skin.scatter(12, { rng: rng(8), minDist: 0.12, filter: (h) => h.n.y < 0.3 && h.n.y > -0.6 }).forEach((h) => {
    b.stick(new THREE.DodecahedronGeometry(0.035 + rand() * 0.02, 0), STONE, h, { embed: 0.4, flat: true });
  });
  skin.scatter(6, { rng: rng(9), minDist: 0.15, filter: (h) => Math.abs(h.n.x) > 0.75 }).forEach((h) => {
    b.stick(new THREE.CylinderGeometry(0.015, 0.015, 0.01, 6), GLOW, h, { embed: 0.3 });
  });
  const nsk = b.surface(b.root);
  void nsk;

  // tail tuft
  b.capsule([0, 0.7, -0.38], [0, 0.78, -0.5], [0.04, 0.02], { bone: hips, color: LEAF2 });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const legs = [
      { n: "F", root: [s * 0.1, 0.58, 0.16], z: 0.18, parent: chest, bends: [[0, 0, 1]] },
      { n: "H", root: [s * 0.1, 0.58, -0.26], z: -0.3, parent: hips, bends: [[0, 0, 1], [0, 0, -1]] },
    ];
    for (const L of legs) {
      const pts = limb(L.root, [s * 0.1, 0.055, L.z], [0.3, 0.28, 0.1], L.bends);
      const ch = b.chain(`leg${L.n}${S}`, pts, {
        parent: L.parent,
        names: [`hip${L.n}${S}`, `knee${L.n}${S}`, `ankle${L.n}${S}`, `hoof${L.n}${S}`],
        role: "leg",
      });
      b.sweep(ch, [0.03, 0.016], { color: WOOD_DARK, sides: 6 });
      const hoofJ = ch.tip!;
      b.part(new THREE.CylinderGeometry(0.024, 0.03, 0.055, 6), HOOF, {
        bone: hoofJ,
        at: [s * 0.1, 0.0275, L.z],
      });
      // moss cuff on the thigh
      b.part(new THREE.IcosahedronGeometry(0.05, 0), LEAF, {
        bone: ch.joints[0],
        at: [s * 0.12, 0.6, L.root[2]],
        flat: true,
      });
    }
  }

  // ---------- head / mask ----------
  b.part(new THREE.SphereGeometry(0.075, 8, 6), WOOD, {
    bone: head,
    at: head.local({ forward: 0.03 }),
    scale: [1, 1.15, 1.05],
  });
  b.frustumBox(head.local({ forward: 0.05 }), head.local({ forward: 0.21, down: 0.01 }), [0.11, 0.09], [0.06, 0.05], {
    bone: head,
    color: WOOD,
  });
  b.frustumBox(head.local({ forward: 0.06, down: 0.045 }), head.local({ forward: 0.19, down: 0.05 }), [0.07, 0.025], [0.045, 0.02], {
    bone: jaw,
    color: WOOD_DARK,
  });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), DARK, { bone: head, at: head.local({ forward: 0.215, down: 0.01 }) });
  b.rod(head.local({ forward: 0.1, up: 0.075 }), head.local({ forward: 0.2, up: 0.04 }), 0.005, { bone: head, color: DARK });

  for (const s of [1, -1]) {
    // eye socket + glowing eye
    b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.05, forward: 0.085, up: 0.03 }),
      scale: [0.7, 1, 1],
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), GLOW, {
      bone: head,
      at: head.local({ left: s * 0.058, forward: 0.095, up: 0.032 }),
    });
    // brow
    b.rod(
      head.local({ left: s * 0.03, forward: 0.1, up: 0.065 }),
      head.local({ left: s * 0.075, forward: 0.07, up: 0.055 }),
      0.008,
      { bone: head, color: BARK },
    );
    // nostril
    b.part(new THREE.SphereGeometry(0.006, 5, 3), DARK, {
      bone: head,
      at: head.local({ left: s * 0.02, forward: 0.22, up: 0.02 }),
    });
    // ears
    b.spike(
      head.local({ left: s * 0.06, up: 0.045, back: 0.02 }),
      [s * 0.8, 0.45, -0.35],
      0.13,
      0.035,
      { bone: head, color: WOOD_DARK, sides: 5 },
    );
  }

  // ---------- antlers ----------
  const flower = (p: THREE.Vector3) => {
    b.part(new THREE.SphereGeometry(0.007, 5, 4), YELLOW, { bone: head, at: [p.x, p.y + 0.004, p.z] });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.008, 5, 4), WHITE, {
        bone: head,
        at: [p.x + Math.cos(a) * 0.011, p.y, p.z + Math.sin(a) * 0.011],
        scale: [1, 0.55, 1],
      });
    }
  };
  const leaf = (p: THREE.Vector3, i: number) => {
    b.part(new THREE.SphereGeometry(1, 5, 4), i % 2 ? LEAF : LEAF2, {
      bone: head,
      at: [p.x, p.y, p.z],
      scale: [0.02, 0.005, 0.01],
      rotation: [rand() * 60 - 30, rand() * 360, rand() * 60 - 30],
    });
  };

  for (const s of [1, -1]) {
    const base = vec(head.local({ left: s * 0.045, up: 0.07, back: 0.02 }));
    const d = (x: number, y: number, z: number) => base.clone().add(new THREE.Vector3(s * x, y, z));
    const main = catmull([base, d(0.03, 0.12, -0.05), d(0.1, 0.24, -0.04), d(0.12, 0.38, 0.04)]);
    b.sweep(main, [0.017, 0.006], { bone: head, color: ANTLER, sides: 6, caps: { start: "flat", end: "point" } });
    const branches: [number, number, number][] = [
      [0.35, 1, 0.08],
      [0.55, -1, 0.1],
      [0.75, 1, 0.09],
    ];
    branches.forEach(([t, k, len], i) => {
      const pt = vec(main.at(t));
      const tip = pt.clone().add(new THREE.Vector3(s * len * 0.9, len * 1.1, k * 0.06));
      b.spike(pt, tip, null, 0.01, { bone: head, color: ANTLER, sides: 5 });
      const mid = pt.clone().lerp(tip, 0.6);
      const tw = mid.clone().add(new THREE.Vector3(s * 0.05, 0.05, -k * 0.04));
      b.spike(mid, tw, null, 0.006, { bone: head, color: ANTLER, sides: 5 });
      flower(tip.clone().add(new THREE.Vector3(0, 0.008, 0)));
      flower(tw.clone().add(new THREE.Vector3(0, 0.008, 0)));
      leaf(mid.clone().add(new THREE.Vector3(s * 0.015, 0.0, 0.015)), i);
      leaf(pt.clone().add(new THREE.Vector3(-s * 0.012, 0.01, -0.012)), i + 1);
    });
    flower(vec(main.at(1)).add(new THREE.Vector3(0, 0.012, 0)));
    leaf(vec(main.at(0.9)).add(new THREE.Vector3(s * 0.015, 0, 0.015)), 0);
    leaf(vec(main.at(0.2)).add(new THREE.Vector3(s * 0.02, 0, 0.012)), 1);
    flower(vec(main.at(0.15)).add(new THREE.Vector3(s * 0.02, 0.01, -0.02)));
  }

  // ---------- fireflies ----------
  const hc = vec(head.at);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const r = 0.3 + (i % 2) * 0.08;
    b.part(new THREE.IcosahedronGeometry(0.011, 0), FLY, {
      bone: head,
      at: [hc.x + Math.cos(a) * r, hc.y + 0.1 + Math.sin(i * 1.7) * 0.12, hc.z + 0.05 + Math.sin(a) * r],
    });
  }

  return b.root;
}
