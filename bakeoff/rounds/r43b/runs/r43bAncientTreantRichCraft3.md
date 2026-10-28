```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, paint, noise, cells, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Ancient Treant",
  description: "A towering, mossy walking tree guardian with glowing amber eyes, antler branches, a moss beard and root feet.",
};

const MOSS = "#4f7a2a";
const MOSSL = "#8ab53e";
const AMBER = "#ffb02a";
const IVORY = "#d8c9a0";
const GREENS = ["#3f7a2a", "#5d9a30", "#7dbb3c", "#2f5f26"];

function barkPaint(dark: string, mid: string, light: string, seed: number) {
  return paint((p, n) => {
    const q = new THREE.Vector3(p.x, p.y * 0.15, p.z);
    const g = noise(q, 0.07, seed);
    let c = mix(mix(dark, mid, smoothstep(0.25, 0.65, g)), light, smoothstep(0.65, 0.9, noise(p, 0.3, seed + 3)) * 0.5);
    const cl = cells(q, 0.14, seed + 5);
    if (cl.d2 - cl.d1 < 0.05) c = mix(c, dark, 0.8);
    const m = noise(p, 0.28, seed + 8);
    const mossAmt = smoothstep(0.1, 0.5, n.y) * smoothstep(0.42, 0.58, m);
    c = mix(c, mix(MOSS, MOSSL, noise(p, 0.1, seed + 2)), mossAmt);
    if (p.y < 0.35) c = mix(c, "#2b2216", 0.45 * (1 - p.y / 0.35));
    const k = 0.8 + 0.2 * smoothstep(-0.8, 0.6, n.y);
    return [c[0] * k, c[1] * k, c[2] * k] as [number, number, number];
  });
}

const BARK = barkPaint("#241509", "#5a3b20", "#8a6338", 3);
const BARKL = barkPaint("#3a2412", "#6e4a28", "#9a7442", 9);
const BARKD = "#241509";

const LEAF = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 2 C36 16 38 44 20 62 C2 44 4 16 20 2Z" fill="#4f9a32" stroke="#1f4a1a" stroke-width="2.5"/><path d="M20 6 L20 60" stroke="#b6e060" stroke-width="2.5"/><path d="M20 22 L10 14 M20 34 L8 26 M20 22 L30 14 M20 34 L32 26 M20 46 L12 40 M20 46 L28 40" stroke="#8cc548" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const LEAF2 = svg(
  `<svg viewBox="0 0 40 64"><path d="M20 2 C36 16 38 44 20 62 C2 44 4 16 20 2Z" fill="#c88a22" stroke="#6a3a10" stroke-width="2.5"/><path d="M20 6 L20 60" stroke="#ffe08a" stroke-width="2.5"/><path d="M20 22 L10 14 M20 34 L8 26 M20 22 L30 14 M20 34 L32 26" stroke="#f0b64a" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const MOSSTEX = svg(
  `<svg viewBox="0 0 48 64"><path d="M4 64 L8 8 L12 64Z M14 64 L20 14 L26 64Z M26 64 L31 2 L36 64Z M36 64 L42 18 L46 64Z" fill="#6a9a30" stroke="#2f5a1c" stroke-width="1.5"/><path d="M8 40 L9 20 M20 44 L21 26 M31 42 L31 14" stroke="#b6d860" stroke-width="2"/><circle cx="8" cy="9" r="2.5" fill="#c4e070"/><circle cx="31" cy="3" r="2.5" fill="#c4e070"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#140b05"/><circle cx="50" cy="50" r="42" fill="none" stroke="#ffb02a" stroke-width="4"/><circle cx="50" cy="50" r="34" fill="none" stroke="#ff8a1c" stroke-width="2"/><path d="M50 80 L50 40 M50 56 L34 40 M50 48 L66 32 M50 66 L38 56 M50 66 L64 54 M50 40 L50 22" stroke="#ffd060" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="50" cy="20" r="5" fill="#fff0b0"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "treant" });
  const R = rng(11);
  const v = (p: number[], d: number[], k: number) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 2.0, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 2.0, 0], [0, 2.8, 0.02], [0, 3.6, 0.12]]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 3.7, 0.18], dir: [0, 0.4, 1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 3.95, 0.3], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.88, 0.3], aim: [0, 3.88, 0.8], role: "jaw" });

  // ---------- helpers ----------
  const ico = (r: number, d = 1) => new THREE.IcosahedronGeometry(r, d);
  const knob = (at: number[], sc: number[], bone: any, color: any = BARK) =>
    b.part(ico(1, 1), color, { at, scale: sc, bone, flat: true });

  function clump(at: number[], r: number, bone: any, cards = 6) {
    for (let i = 0; i < 3; i++) {
      const o = [(R() - 0.5) * r, (R() - 0.2) * r * 0.5, (R() - 0.5) * r];
      b.part(ico(1, 0), GREENS[Math.floor(R() * 4)], {
        at: [at[0] + o[0], at[1] + o[1], at[2] + o[2]],
        scale: [r * 0.55, r * 0.42, r * 0.55],
        bone,
        flat: true,
      });
    }
    const fr = [];
    for (let i = 0; i < cards; i++) {
      const d = [(R() - 0.5) * 2, 0.3 + R(), (R() - 0.5) * 2];
      fr.push(frame(v(at, [0, 0, 0], 0), d));
    }
    b.cards(fr, [LEAF, LEAF, LEAF2], {
      size: [r * 0.7, r * 0.85],
      lean: 50,
      bend: 20,
      cross: true,
      vary: 0.3,
      rng: R,
      bone,
    });
  }

  function branch(pts: number[][], r0: number, bone: any, color: any = BARKL) {
    b.sweep(catmull(pts), [r0, r0 * 0.18], { bone, color, sides: 6, smooth: false, caps: { start: "flat", end: "point" } });
  }

  // ---------- torso ----------
  const torso = b.sweep(spine, (t) => [0.58 + 0.38 * t * t + 0.04 * Math.sin(t * 3), 0.5 + 0.1 * t], {
    color: BARK,
    sides: 8,
    smooth: false,
    extend: [0, 0.12],
  });
  knob([0, 1.95, 0], [0.78, 0.5, 0.62], hips);
  const skin = b.surface(torso);
  for (const h of skin.scatter(26, { rng: R, minDist: 0.3, filter: (h) => h.n.y > -0.2 }))
    b.stick(new THREE.BoxGeometry(0.1, 0.4, 0.09), BARKD, h, { embed: 0.5 });
  for (const h of skin.scatter(14, { rng: R, minDist: 0.3, filter: (h) => h.n.y > 0.3 }))
    b.stick(ico(0.1, 0), MOSSL, h, { embed: 0.3, flat: true });
  const rh = skin.ray([0, 2.9, 3], [0, 0, -1]);
  glow(
    b.decal(torso, RUNE, { at: rh ?? [0, 2.9, 0.6], dir: [0, 0, 1], size: [0.55, 0.55], segments: 8 }),
    1.2,
  );
  const loop = skin.loop([0, 2.35, 0], { lift: 0.03 });
  b.sweep(loop, 0.04, { color: "#4a7a28", sides: 5 });
  b.along(skin.loop([0, 2.35, 0], { lift: 0.06 }), 12, (at) =>
    b.part(ico(0.07, 0), MOSSL, { frame: at, flat: true }),
  );

  // shoulders
  for (const s of [1, -1]) {
    knob([s * 0.98, 3.4, 0.0], [0.52, 0.44, 0.5], chest);
    knob([s * 0.98, 3.75, -0.02], [0.4, 0.2, 0.42], chest);
    glow(b.part(ico(0.08, 0), AMBER, { at: [s * 1.3, 3.6, 0.2], bone: chest, flat: true }), 1.3);
    clump([s * 1.0, 3.95, -0.05], 0.55, chest, 5);
  }

  // ---------- neck & head ----------
  b.rod([0, 3.5, 0.1], [0, 3.88, 0.24], 0.36, { color: BARK, bone: neck, sides: 8, smooth: false });
  knob([0, 4.1, 0.3], [0.5, 0.52, 0.5], head);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.42, 0.14, 0.26), BARKL, { at: [s * 0.22, 4.3, 0.64], rotation: [10, 0, s * 15], bone: head });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), "#120a05", { at: [s * 0.2, 4.18, 0.69], bone: head });
    glow(b.part(new THREE.SphereGeometry(0.066, 8, 6), AMBER, { at: [s * 0.2, 4.18, 0.75], bone: head }), 1.6);
    knob([s * 0.34, 4.0, 0.52], [0.15, 0.13, 0.14], head, BARKL);
    b.spike([s * 0.45, 4.15, 0.25], [s, 0.2, 0], 0.22, 0.08, { color: BARKL, bone: head });
  }
  b.spike([0, 4.15, 0.74], [0, -0.35, 1], 0.32, 0.1, { color: BARKL, bone: head });
  b.part(new THREE.BoxGeometry(0.62, 0.14, 0.5), BARK, { at: [0, 3.93, 0.55], bone: head });
  b.part(new THREE.BoxGeometry(0.5, 0.05, 0.4), "#0d0704", { at: [0, 3.87, 0.52], bone: head });
  b.part(new THREE.BoxGeometry(0.58, 0.12, 0.5), BARK, { at: [0, 3.8, 0.55], bone: jaw });
  knob([0, 3.75, 0.8], [0.2, 0.14, 0.16], jaw, BARKL);
  for (const s of [1, -1]) b.spike([s * 0.2, 3.84, 0.78], [0, 1, 0.15], 0.22, 0.05, { color: IVORY, bone: jaw });

  // moss beard
  const row = (y: number, zoff: number, n: number, len: number) => {
    const fr = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      fr.push(frame([(u - 0.5) * 0.6, y, 0.82 - Math.abs(u - 0.5) * 0.55 - zoff], [0, 1, 0]));
    }
    b.cards(fr, MOSSTEX, { size: [0.17, len], lean: 180, flow: [0, 0, 1], bone: jaw, vary: 0.25, rng: R });
  };
  row(3.76, 0, 11, 0.6);
  row(3.72, 0.12, 9, 0.8);
  row(3.7, 0.25, 7, 0.55);

  // antlers
  for (const s of [1, -1]) {
    const main = [[s * 0.22, 4.4, 0.2], [s * 0.55, 4.95, 0.1], [s * 0.5, 5.5, 0.0], [s * 0.85, 6.0, -0.05]];
    branch(main, 0.11, head);
    const c = catmull(main);
    const m1 = c.at(0.45).toArray();
    branch([m1, v(m1, [s, 0.6, 0.2], 0.3), v(m1, [s, 0.7, 0.3], 0.7)], 0.07, head);
    const m2 = c.at(0.75).toArray();
    branch([m2, v(m2, [-s, 0.6, 0], 0.3), v(m2, [-s, 0.9, -0.1], 0.6)], 0.06, head);
    clump(main[3], 0.6, head, 7);
    clump(v(m1, [s, 0.7, 0.3], 0.7), 0.4, head, 5);
    clump(v(m2, [-s, 0.9, -0.1], 0.6), 0.35, head, 4);
  }
  branch([[0, 4.5, 0.1], [0, 5.0, -0.05], [0, 5.5, -0.15]], 0.1, head);
  clump([0, 5.55, -0.15], 0.55, head, 6);

  // back branches
  for (const s of [1, -1]) {
    const br = [[s * 0.4, 3.4, -0.4], [s * 0.8, 4.2, -0.65], [s * 1.2, 5.0, -0.6], [s * 1.5, 5.5, -0.5]];
    branch(br, 0.16, chest);
    clump(br[3], 0.65, chest, 7);
    clump(br[2], 0.5, chest, 5);
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.5, 2.0, 0], [s * 0.6, 0.2, 0.15], [1.05, 0.95], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.42, 0.3, 0.2], { color: BARK, sides: 8, smooth: false });
    const tip = leg.tip!;
    knob(pts[1].toArray(), [0.36, 0.34, 0.36], leg.joints[1]);
    knob([s * 0.6, 0.12, 0.38], [0.4, 0.14, 0.6], tip);
    for (let i = 0; i < 4; i++)
      b.spike([s * (0.6 + (i - 1.5) * 0.12), 0.11, 0.7], [(i - 1.5) * 0.4, -0.04, 1], 0.5, 0.1, { color: BARKL, bone: tip, sides: 6 });
    b.spike([s * 0.6, 0.11, 0.0], [0, -0.02, -1], 0.35, 0.1, { color: BARKL, bone: tip, sides: 6 });
    b.spike([s * 0.8, 0.11, 0.25], [s, -0.05, 0.3], 0.5, 0.09, { color: BARKL, bone: tip, sides: 6 });
    b.spike([s * 0.45, 0.11, 0.15], [-s, -0.05, 0.1], 0.35, 0.08, { color: BARKL, bone: tip, sides: 6 });
    clump([s * 0.55, 1.7, -0.3], 0.3, leg.joints[0], 3);
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 1.05, 3.3, 0.05], [s * 1.85, 1.55, 0.35], [1.15, 1.15], [0, 0, -1]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.3, 0.27, 0.19], { color: BARK, sides: 8, smooth: false });
    const wr = arm.tip!;
    const w = pts[2].toArray();
    knob(pts[1].toArray(), [0.3, 0.3, 0.3], arm.joints[1]);
    knob(w, [0.22, 0.24, 0.17], wr, BARKL);
    // twigs on the forearm
    for (const t of [0.2, 0.5, 0.75]) {
      const base = pts[1].clone().lerp(pts[2], t).toArray();
      const d = [s * 0.8, 0.6, -0.5];
      branch([base, v(base, d, 0.3), v(base, [s, 1.2, -0.6], 0.55)], 0.06, arm.joints[1]);
      if (t > 0.4) clump(v(base, [s, 1.2, -0.6], 0.55), 0.3, arm.joints[1], 4);
    }
    // fingers
    for (let i = 0; i < 5; i++) {
      const thumb = i === 4;
      const dir = thumb ? [-s * 0.5, -0.4, 0.9] : [s * 0.25, -1, (i - 1.5) * 0.28];
      const st = thumb ? v(w, [-s * 0.5, 0, 0.5], 0.14) : v(w, [0, -1, (i - 1.5) * 0.5], 0.14);
      const p1 = v(st, dir, 0.3);
      const p2 = v(v(p1, dir, 0.28), [0, 0, 1], 0.06);
      const f = b.chain(`f${i}${S}`, [st, p1, p2], {
        parent: wr,
        names: [`f${i}${S}a`, `f${i}${S}b`, `f${i}${S}c`],
        role: "digit",
      });
      b.sweep(f, [thumb ? 0.07 : 0.065, 0.018], { color: BARKL, sides: 6, smooth: false, caps: "point" });
    }
  }

  return b.root;
}
```