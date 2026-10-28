```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, bezier, limb, paint, mix, resolve, smoothstep, mottle, countershade, grain } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Swamp Troll",
  description: "Hunched Darkspear-style swamp troll with tusks, a crimson mohawk, war paint and bone fetishes.",
};

type P3 = [number, number, number];
const add = (p: number[], x: number, y: number, z: number): P3 => [p[0] + x, p[1] + y, p[2] + z];

const BONE = "#e8dfc4", BONE_D = "#b8a888", RED = "#b3202a", ORANGE = "#f08a24", DARK = "#1c1a1f";
const MUD = [0.25, 0.2, 0.12] as const;
const CLOTH_D = "#7a2a1c", LEATHER = "#5b3a22", EYE = "#d8f23a", TEAL_D = "#2a5568";

const WARPAINT = svg(
  `<svg viewBox="0 0 64 64"><path d="M6 10 L58 14 M10 30 L54 34 M14 50 L50 52" stroke="#f4efe0" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M32 4 L32 60" stroke="#c0202a" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="32" r="8" fill="none" stroke="#f4efe0" stroke-width="4"/></svg>`,
  { size: 128 },
);
const CHEEK = svg(
  `<svg viewBox="0 0 48 48"><path d="M4 8 L44 20 M4 22 L40 32 M6 36 L34 42" stroke="#f4efe0" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`,
  { size: 96 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 Q2 36 8 6 Q16 -2 24 6 Q30 36 16 62Z" fill="#1f8fa0" stroke="#10303a" stroke-width="2"/><path d="M16 62 Q10 40 16 12" stroke="#f0d060" stroke-width="3" fill="none"/><path d="M16 22 L8 14 M16 34 L7 26 M16 22 L24 14 M16 34 L25 26" stroke="#f0d060" stroke-width="2"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const R = rng(11);

  // ---------- paints
  const base = countershade(mottle("#3f8a94", "#2f6a7c", { size: 0.16 }), "#86b4a2", { level: -0.35 });
  const SKIN = paint((p, n) => {
    const c = resolve(base, p, n);
    return mix(c, MUD, 0.8 * smoothstep(0.3, 0.04, p.y));
  });
  const CLOTH = paint((_p, _n, s) => (s[1] < -0.3 ? CLOTH_D : "#8a5a30"));
  const BLADE = paint((_p, _n, s) => (s[1] > 0.17 ? ORANGE : s[1] > 0.08 ? "#e0502a" : RED));
  const LEATH = grain(LEATHER, "#3a2314", { size: 0.02 });

  // ---------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.0, 0.02], [0, 1.25, 0.08], [0, 1.55, 0.2], [0, 1.78, 0.3]]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain("neck", catmull([[0, 1.78, 0.3], [0, 1.9, 0.43], [0, 1.98, 0.54]]), {
    parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.98, 0.54], dir: [0, -0.05, 1], role: "head" });
  const HC: P3 = [0, 2.0, 0.64];
  const jaw = b.joint("jaw", { parent: head, at: add(HC, 0, -0.08, 0.02), aim: add(HC, 0, -0.12, 0.3), role: "jaw" });

  // ---------- torso
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: hips, at: [0, 1.0, 0.02], scale: [0.36, 0.3, 0.32] });
  const body = b.sweep(spine, (t) => [0.3 + 0.1 * t, 0.26 + 0.06 * t], { color: SKIN, sides: 10 });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: spine.joints[2], at: [0, 1.82, 0.1], scale: [0.34, 0.26, 0.3] }); // hump
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, { bone: spine.joints[1], at: [0, 1.28, 0.3], scale: [0.3, 0.24, 0.2] }); // belly
  b.sweep(neck, [0.2, 0.15], { color: SKIN, sides: 8 });
  b.decal(body, WARPAINT, { at: [0, 1.55, 0.5], dir: [0, 0.15, 1], size: [0.4, 0.4] });

  // ---------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: HC, scale: [0.19, 0.17, 0.2] });
  b.part(new THREE.BoxGeometry(0.22, 0.13, 0.22), SKIN, { bone: head, at: add(HC, 0, -0.06, 0.18) });
  b.part(new THREE.BoxGeometry(0.34, 0.05, 0.12), TEAL_D, { bone: head, at: add(HC, 0, 0.065, 0.13), rotation: [-12, 0, 0] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), "#2b4a58", { bone: head, at: add(HC, 0, -0.01, 0.3), scale: [1.2, 0.9, 1] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.032, 8, 6), EYE, { bone: head, at: add(HC, s * 0.085, 0.035, 0.165) }), 1.2);
    b.part(new THREE.SphereGeometry(0.013, 6, 4), DARK, { bone: head, at: add(HC, s * 0.088, 0.035, 0.193), scale: [0.6, 1.6, 0.6] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), DARK, { bone: head, at: add(HC, s * 0.03, 0.01, 0.38) }); // nostril
    b.decal(skull, CHEEK, { at: add(HC, s * 0.1, -0.04, 0.12), dir: [s * 0.55, 0, 0.8], size: [0.1, 0.1], mirror: s > 0 });
    // ears
    b.extrude([[0, -0.05], [0.12, -0.07], [0.34, 0.1, "sharp"], [0.1, 0.07]], {
      at: add(HC, s * 0.16, 0.04, -0.03), x: [s, 0, -0.35], y: [0, 1, 0], thickness: 0.025, color: TEAL_D, bone: head,
    });
    // tusks (lower jaw)
    b.sweep(bezier(add(HC, s * 0.09, -0.15, 0.25), add(HC, s * 0.13, -0.1, 0.36), add(HC, s * 0.115, 0.04, 0.37)), [0.032, 0],
      { color: BONE, bone: jaw, caps: { start: "flat", end: "point" }, sides: 6 });
    // small upper fangs
    b.spike(add(HC, s * 0.06, -0.115, 0.27), [0, -1, 0], 0.05, 0.014, { color: BONE, bone: head });
  }
  // lower jaw
  b.part(new THREE.BoxGeometry(0.24, 0.07, 0.24), SKIN, { bone: jaw, at: add(HC, 0, -0.14, 0.18) });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.2), "#7a2a3a", { bone: jaw, at: add(HC, 0, -0.1, 0.17) });
  b.spike(add(HC, 0, -0.17, 0.3), [0, -1, 0.3], 0.07, 0.03, { color: SKIN, bone: jaw }); // chin
  for (let i = -1; i <= 1; i++) b.spike(add(HC, i * 0.06, -0.11, 0.3), [0, 1, 0], 0.03, 0.01, { color: BONE, bone: jaw });

  // ---------- mohawk
  const hawk = catmull([add(HC, 0, 0.17, 0.12), add(HC, 0, 0.19, -0.02), [0, 2.12, 0.4], [0, 2.0, 0.3], [0, 1.88, 0.22]]);
  const hh = [0.2, 0.3, 0.36, 0.34, 0.3, 0.26, 0.2, 0.15];
  hh.forEach((h, i) => {
    const t = i / (hh.length - 1);
    const pt = hawk.at(t);
    const bn = i < 3 ? head : neck.joints[Math.min(1, i - 3)];
    b.extrude([[-0.06, 0], [0.06, 0], [0.04, h * 0.6], [-0.05, h, "sharp"]], {
      at: [pt.x, pt.y - 0.02, pt.z], x: [0, 0, -1], y: [0, 1, -0.2], thickness: 0.035, bevel: 0.006, color: BLADE, bone: bn,
    });
  });

  // ---------- arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = new THREE.Vector3(s * 0.42, 1.72, 0.2);
    const wr = [s * 0.98, 0.98, 0.3];
    const pts = limb(sh, wr, [0.52, 0.56], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, pts, { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" });
    b.sweep(arm, [0.13, 0.085], { color: SKIN, sides: 8 });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), SKIN, { bone: arm.joints[0], at: [sh.x, sh.y, sh.z] });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN, { bone: arm.tip!, at: wr as P3, scale: [1, 1, 0.8] });
    const wp = new THREE.Vector3(...(wr as P3));
    const d = wp.clone().sub(pts[1]).normalize();
    for (let k = 0; k < 4; k++) {
      const base0 = wp.clone().addScaledVector(d, 0.07).add(new THREE.Vector3((k - 1.5) * 0.045, 0, 0.0));
      const tip = base0.clone().addScaledVector(d, 0.17).add(new THREE.Vector3(0, -0.02, 0.01 * (k - 1)));
      const j = b.joint(`finger${side}${k + 1}`, { parent: arm.tip!, at: base0.toArray() as P3, aim: tip.toArray() as P3, role: "digit" });
      b.capsule(base0.toArray() as P3, tip.toArray() as P3, 0.024, SKIN, { bone: j, sides: 6 });
      b.spike(tip.toArray() as P3, d.toArray() as P3, 0.07, 0.016, { color: BONE, bone: j, sides: 5 });
    }
    {
      const tb = wp.clone().addScaledVector(d, 0.04).add(new THREE.Vector3(0, 0, 0.07));
      const tt = tb.clone().add(new THREE.Vector3(-s * 0.02, -0.02, 0.1));
      const j = b.joint(`thumb${side}`, { parent: arm.tip!, at: tb.toArray() as P3, aim: tt.toArray() as P3, role: "digit" });
      b.capsule(tb.toArray() as P3, tt.toArray() as P3, 0.024, SKIN, { bone: j, sides: 6 });
      b.spike(tt.toArray() as P3, [0, -0.2, 1], 0.06, 0.015, { color: BONE, bone: j, sides: 5 });
    }
    // bone armband + bracer
    const c = arm.at(0.55);
    b.part(new THREE.TorusGeometry(0.115, 0.022, 5, 10), LEATH, { at: c.at, dir: c.tangent, axis: "z", bone: arm.joints[1] });
    const c2 = arm.at(0.2);
    b.part(new THREE.TorusGeometry(0.13, 0.02, 5, 10), BONE, { at: c2.at, dir: c2.tangent, axis: "z", bone: arm.joints[0] });
    // shoulder pad
    b.part(new THREE.SphereGeometry(1, 8, 6), s > 0 ? LEATH : "#6a4a8a", {
      bone: chest, at: [s * 0.52, 1.84, 0.2], scale: [0.2, 0.1, 0.22],
    });
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.46 + i * 0.07), 1.9 - i * 0.015, 0.2 + (i - 1) * 0.07], [s * 0.5, 1, 0], 0.17 - i * 0.03, 0.035,
        { color: s > 0 ? BONE : "#1f8fa0", bone: chest, sides: 6 });
  }

  // ---------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = new THREE.Vector3(s * 0.25, 0.95, 0);
    const pts = limb(hip, [s * 0.3, 0.14, 0.02], [0.48, 0.5], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", contact: [s * 0.3, 0, 0.1] });
    b.sweep(leg, [0.18, 0.12, 0.1], { color: SKIN, sides: 8 });
    b.part(new THREE.SphereGeometry(0.13, 8, 6), SKIN, { bone: leg.joints[1], at: pts[1].toArray() as P3 });
    const an = leg.tip!;
    b.part(new THREE.BoxGeometry(0.22, 0.12, 0.3), SKIN, { bone: an, at: [s * 0.3, 0.06, 0.1] });
    b.part(new THREE.BoxGeometry(0.24, 0.05, 0.1), "#2a5a4a", { bone: an, at: [s * 0.3, 0.12, 0.03] });
    for (let k = -1; k <= 1; k++) {
      const x = s * 0.3 + k * 0.075;
      const a: P3 = [x, 0.05, 0.22], z: P3 = [x, 0.05, 0.4];
      const j = b.joint(`toe${side}${k + 2}`, { parent: an, at: a, aim: z, role: "digit" });
      b.capsule(a, z, 0.05, SKIN, { bone: j, sides: 6 });
      b.spike(z, [0, -0.1, 1], 0.09, 0.025, { color: BONE_D, bone: j, sides: 5 });
    }
    b.part(new THREE.TorusGeometry(0.13, 0.02, 5, 10), BONE, { at: leg.at(0.85).at, dir: leg.at(0.85).tangent, axis: "z", bone: an });
  }

  // ---------- loincloth, belt
  const flap = (z: number, bone: any) =>
    b.extrude([[-0.2, 0], [-0.2, -0.36], [-0.1, -0.27], [0, -0.44], [0.1, -0.27], [0.2, -0.36], [0.2, 0]], {
      at: [0, 1.12, z], x: [1, 0, 0], thickness: 0.025, color: CLOTH, bone,
    });
  flap(0.35, hips);
  flap(-0.28, hips);
  const skin = b.surface(body);
  const beltPath = skin.loop([0, 1.12, 0.03], { lift: 0.02 });
  b.sweep(beltPath, 0.032, { color: LEATH, bone: hips });
  b.along(skin.loop([0, 1.12, 0.03], { lift: 0.045 }), 10, (at) =>
    b.part(new THREE.ConeGeometry(0.02, 0.1, 5), BONE, { at, dir: [0, -1, 0.1], bone: hips }),
  );
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.03), "#c9a24a", { bone: hips, at: [0, 1.12, 0.36] });

  // ---------- fetishes
  const skullFetish = (at: P3, dirv: P3, sc: number, bone: any) => {
    const f = frame(at, dirv);
    b.part(new THREE.SphereGeometry(sc, 8, 6), BONE, { at, bone, scale: [1, 1.05, 1.1] });
    b.part(new THREE.BoxGeometry(sc * 1.1, sc * 0.5, sc * 0.9), BONE_D, { at: f.local([0, 0, 0]).toArray ? add(at, 0, -sc * 0.85, sc * 0.2) : at, bone });
    for (const s of [1, -1])
      glow(b.part(new THREE.SphereGeometry(sc * 0.22, 6, 4), "#7dff6a", { at: add(at, s * sc * 0.4, sc * 0.05, sc * 0.85), bone }), 1.4);
  };
  // necklace draped on chest
  const neckPath = skin.drape(catmull([[-0.3, 1.9, 0.2], [-0.2, 1.62, 0.45], [0, 1.5, 0.5], [0.2, 1.62, 0.45], [0.3, 1.9, 0.2]]), { lift: 0.025 });
  b.sweep(neckPath, 0.014, { color: LEATH, bone: chest });
  b.along(neckPath, 7, (at) => b.part(new THREE.ConeGeometry(0.022, 0.1, 5), BONE, { at, dir: [0, -1, 0.3], bone: chest }));
  skullFetish([0, 1.43, 0.58], [0, 0, 1], 0.06, chest);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 5), BONE_D, { bone: chest, at: [0.14, 1.55, 0.52], rotation: [0, 0, 25] });
  // hip skull with feathers
  skullFetish([0.3, 0.98, 0.3], [1, 0, 0.3], 0.07, hips);
  b.cards([frame([0.3, 0.92, 0.28], [0, 1, 0]), frame([0.36, 0.92, 0.25], [0, 1, 0])], FEATHER, {
    size: [0.09, 0.3], lean: 180, flow: [0, 0, 1], bone: hips,
  });
  // bone dangles on belt right
  for (let i = 0; i < 3; i++) {
    const x = -0.28 - i * 0.04;
    b.capsule([x, 1.1, 0.26 - i * 0.04], [x - 0.02, 0.9 - i * 0.04, 0.26 - i * 0.04], 0.018, BONE, { bone: hips, sides: 5 });
  }
  // ear/head feathers
  b.cards([frame(add(HC, 0.3, 0.02, -0.1), [0, 1, 0]), frame(add(HC, 0.32, 0.0, -0.06), [0, 1, 0])], FEATHER, {
    size: [0.08, 0.28], lean: 180, flow: [0, 0, 1], bone: head,
  });
  b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 8), "#c9a24a", { bone: head, at: add(HC, 0.3, 0.04, -0.07), dir: [1, 0, 0], axis: "z" });
  void R;
  return b.root;
}
```