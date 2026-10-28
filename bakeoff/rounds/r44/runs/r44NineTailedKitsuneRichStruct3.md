```ts
import * as THREE from "three";
import { createBuilder, limb, catmull, noise, mix, paint, countershade, mottle, svg, DEG } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kitsune",
  description:
    "A nine-tailed kitsune fox in high-fantasy anime style: golden coat with a white belly and ruff, black socks and ear tips, red kumadori eye marks, a forehead sigil, a bell collar, nine fanned tails with gold rings and blue spirit-flame tips, and floating hitodama.",
};

const ORANGE = "#f2a444";
const ORANGE_D = "#e0822c";
const CREAM = "#fff3df";
const SOCK = "#2a1a1e";
const RED = "#c8283c";
const GOLD = "#f3c243";
const GOLD_D = "#a8741c";
const PINK = "#f4a9b4";
const FLAME = "#6fe3ff";
const FLAME_W = "#e9fbff";
const NOSE = "#1c1216";

export default function build() {
  const b = createBuilder({ name: "kitsune", paintSize: 1024 });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- paints
  const base = countershade(mottle(ORANGE, ORANGE_D, { size: 0.22, contrast: 0.7 }), CREAM, { level: -0.35 });
  const coat = paint((p) => (p.y < 0.26 + 0.04 * noise(p, 0.06, 3) ? SOCK : base));
  const headCoat = paint((p) => (Math.abs(p.x) > 0.07 && p.y < 1.16 ? CREAM : p.z > 0.92 ? CREAM : coat));

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.7, -0.35], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.7, -0.35], [0, 0.74, 0], [0, 0.78, 0.35]]), {
    parent: hips,
    role: "spine",
    names: ["spine1", "chest"],
  });
  const chest = spine.joints[1];
  const neck = b.chain("neck", catmull([[0, 0.8, 0.35], [0, 0.98, 0.52], [0, 1.1, 0.66]]), {
    parent: chest,
    role: "neck",
    names: ["neck1", "neck2"],
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.1, 0.66], dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.05, 0.76], aim: [0, 1.04, 0.98], role: "jaw" });

  // ---------------------------------------------------------------- body
  b.sweep(spine, (t) => [0.15 + 0.05 * Math.sin(Math.PI * t) + 0.03 * t, 0.17 + 0.06 * Math.sin(Math.PI * t)], {
    color: coat,
    sides: 10,
    name: "body",
  });
  const neckTube = b.sweep(neck, [0.125, 0.085], { color: coat, sides: 8, name: "neck" });
  b.part(new THREE.IcosahedronGeometry(0.17, 1), CREAM, { bone: chest, at: [0, 0.78, 0.42], scale: [1, 1, 0.9], flat: true, name: "chestFluff" });
  b.ring(neck.joints[0], { count: 10, radius: 0.12, tilt: 55 }, (it) => b.spike(it, it, 0.16, 0.05, { color: CREAM, sides: 4, smooth: false }));

  // ---------------------------------------------------------------- head
  const skull = b.loft(
    [
      { at: [0, 1.14, 0.62], w: 0.23, h: 0.22 },
      { at: [0, 1.14, 0.76], w: 0.26, h: 0.23 },
      { at: [0, 1.1, 0.9], w: 0.14, h: 0.12 },
      { at: [0, 1.085, 1.0], w: 0.07, h: 0.07 },
    ],
    { bone: head, color: headCoat, sides: 8, name: "skull" },
  );
  b.loft(
    [
      { at: [0, 1.04, 0.78], w: 0.13, h: 0.05 },
      { at: [0, 1.03, 0.92], w: 0.08, h: 0.04 },
      { at: [0, 1.03, 0.99], w: 0.05, h: 0.035 },
    ],
    { bone: jaw, color: CREAM, sides: 6, name: "jawTube" },
  );
  b.part(new THREE.SphereGeometry(0.03, 6, 5), NOSE, { bone: head, at: [0, 1.09, 1.04], scale: [1, 0.8, 0.8], name: "nose" });

  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    // ears
    const ear = b.joint(`ear${k}`, { parent: head, at: [s * 0.09, 1.23, 0.7], dir: [s * 0.25, 1, -0.2], role: "hinge" });
    const earPaint = paint((_p, _n, st) => {
      if (st[1] > 0.14) return SOCK;
      return st[1] > 0.02 && st[1] < 0.15 - 2.4 * Math.abs(st[0]) ? PINK : ORANGE;
    });
    b.extrude([[-0.06, 0], [0.06, 0], [0, 0.22, "sharp"]], {
      at: [s * 0.09, 1.23, 0.7],
      x: [s, 0, 0],
      y: [s * 0.25, 1, -0.2],
      thickness: 0.025,
      bevel: 0.005,
      color: earPaint,
      bone: ear,
      name: `ear${k}`,
    });
    // cheek ruff
    for (let i = 0; i < 3; i++)
      b.spike([s * 0.12, 1.1 - i * 0.025, 0.74 - i * 0.03], [s, -0.2 - i * 0.15, -0.35], 0.11 - i * 0.015, 0.03, { bone: head, color: CREAM, sides: 4, smooth: false });
  }

  // eyes
  const eyeTex = svg(
    `<svg viewBox="0 0 64 40">
      <path d="M0 14 Q18 6 40 12 Q55 16 62 4 Q56 26 36 32 Q16 36 4 30 Q14 26 14 22Z" fill="#c8283c"/>
      <path d="M8 24 Q30 2 58 18 Q36 38 8 24Z" fill="#241014"/>
      <ellipse cx="36" cy="21" rx="12" ry="9" fill="#ffb21c"/>
      <ellipse cx="36" cy="23" rx="12" ry="5" fill="#ff7a14" opacity="0.6"/>
      <ellipse cx="36" cy="21" rx="3.2" ry="8" fill="#1a0a0e"/>
      <circle cx="31" cy="17" r="3.4" fill="#fff"/>
      <circle cx="41" cy="26" r="1.6" fill="#fff"/>
    </svg>`,
    { size: 192 },
  );
  for (const s of [1, -1])
    b.decal(skull, eyeTex, {
      at: [s * 0.1, 1.17, 0.8],
      dir: [s * 0.8, 0.1, 0.6],
      size: [0.085, 0.053],
      mirror: s > 0,
      name: `eye${s > 0 ? "L" : "R"}`,
    });
  const sigil = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 3 Q30 18 20 37 Q10 18 20 3Z" fill="#c8283c"/><circle cx="20" cy="22" r="4" fill="#f3c243"/></svg>`,
    { size: 96 },
  );
  b.decal(skull, sigil, { at: [0, 1.25, 0.76], dir: [0, 0.6, 0.8], size: [0.06, 0.06], name: "sigil" });

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const defs = [
      { n: "F", root: [s * 0.13, 0.68, 0.3], foot: [s * 0.12, 0.04, 0.32], len: [0.28, 0.28, 0.12], bend: [[0, 0, -1], [0, 0, 1]], names: ["shoulder", "elbow", "wrist", "paw"], parent: chest },
      { n: "H", root: [s * 0.13, 0.68, -0.38], foot: [s * 0.12, 0.04, -0.4], len: [0.3, 0.3, 0.12], bend: [[0, 0, 1], [0, 0, -1]], names: ["hip", "knee", "hock", "pawH"], parent: hips },
    ];
    for (const d of defs) {
      const pts = limb(d.root as [number, number, number], d.foot as [number, number, number], d.len, d.bend as [number, number, number][]);
      const leg = b.chain(`leg${d.n}${k}`, pts, {
        parent: d.parent,
        role: "leg",
        names: d.names.map((x) => x + k),
        contact: [d.foot[0], 0, d.foot[2]],
      });
      b.sweep(leg, [0.075, 0.05, 0.035, 0.03], { color: coat, sides: 7, name: `leg${d.n}${k}` });
      b.part(new THREE.SphereGeometry(0.045, 6, 5), SOCK, {
        bone: leg.tip!,
        at: [d.foot[0], 0.032, d.foot[2] + 0.03],
        scale: [1, 0.7, 1.5],
        name: "paw",
      });
      b.part(new THREE.IcosahedronGeometry(d.n === "F" ? 0.1 : 0.12, 0), coat, { bone: leg.joints[0], at: leg.joints[0].at, flat: true, name: "legMass" });
    }
  }

  // ---------------------------------------------------------------- collar and bell
  const collar = b.surface(neckTube).loop(neck.at(0.25), { lift: 0.012 });
  b.sweep(collar, 0.02, { color: RED, sides: 5, bone: neck.joints[0], name: "collar" });
  const bellHit = b.surface(neckTube).ray(neck.at(0.3).at.clone().add(v(0, 0, 0.5)), [0, 0, -1]);
  if (bellHit) {
    b.stick(new THREE.SphereGeometry(0.035, 8, 6), GOLD, bellHit, { embed: 0.2, bone: neck.joints[0], name: "bell" });
    b.stick(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 8), GOLD_D, bellHit.moved([0, 0.02, 0]), { embed: 0, bone: neck.joints[0], name: "bellSlit" });
    for (const s of [-1, 1])
      b.spike(bellHit.at.clone().add(v(s * 0.015, -0.03, 0.03)), [s * 0.1, -1, 0.1], 0.14, 0.02, { color: RED, sides: 4, bone: neck.joints[0], name: "tassel" });
  }

  // ---------------------------------------------------------------- nine tails
  const B = v(0, 0.8, -0.62);
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) * 19 * DEG;
    const pts = [0, 0.4, 0.85, 1.3].map((t) =>
      v(B.x + Math.sin(a) * t * 0.85, B.y + Math.cos(a) * 0.6 * t + 0.25 * t * t, B.z - 0.35 * t - 0.15 * t * t),
    );
    const chain = b.chain(`tail${i + 1}`, catmull(pts), {
      parent: hips,
      role: "tail",
      names: [`tail${i + 1}a`, `tail${i + 1}b`, `tail${i + 1}c`],
    });
    b.sweep(chain, [0.05, 0.1, 0.115, 0.075, 0.0], {
      sides: 7,
      bands: [[0.68, ORANGE], [1, CREAM]],
      name: `tail${i + 1}`,
    });
    const p25 = chain.at(0.25);
    b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 10), GOLD, { bone: chain.joints[0], at: p25.at, dir: p25.tangent, axis: "z", name: "tailRing" });
    // spirit flame at the tip
    const tipP = chain.at(1);
    glow(b.spike(tipP, tipP, 0.26, 0.065, { color: FLAME, sides: 6, name: "tailFlame" }), 1.4);
    glow(b.spike(tipP, tipP, 0.17, 0.03, { color: FLAME_W, sides: 5, name: "tailFlameCore" }), 1.6);
    for (const s of [-1, 1])
      glow(b.spike(tipP.at.clone().add(v(s * 0.035, 0, 0)), [s * 0.5, 1, -0.4], 0.14, 0.03, { bone: chain.joints[2], color: FLAME, sides: 5, name: "tailFlick" }), 1.2);
  }

  // ---------------------------------------------------------------- hitodama
  const hito = [[0.65, 1.05, 0.5], [-0.7, 1.3, 0.1], [0.55, 1.6, -0.5], [-0.5, 0.95, 0.9], [0.1, 1.75, 0.3]];
  hito.forEach(([x, y, z], i) => {
    const sc = 0.8 + 0.1 * (i % 3);
    glow(b.part(new THREE.IcosahedronGeometry(0.05 * sc, 1), FLAME, { bone: hips, at: [x, y, z], flat: true, name: "hitodama" }), 1.3);
    glow(b.spike([x, y + 0.03, z], [0.2, 1, 0], 0.17 * sc, 0.045 * sc, { bone: hips, color: FLAME, sides: 6, name: "hitoFlame" }), 1.3);
    glow(b.spike([x, y + 0.03, z], [0.2, 1, 0], 0.1 * sc, 0.022 * sc, { bone: hips, color: FLAME_W, sides: 5, name: "hitoCore" }), 1.6);
  });

  return b.root;
}
```