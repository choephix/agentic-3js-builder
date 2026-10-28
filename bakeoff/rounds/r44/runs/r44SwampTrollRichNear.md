```ts
import * as THREE from "three";
import { createBuilder, frame, limb, rng, catmull, bezier, mottle, paint, mix, resolve, smoothstep, noise, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched, long-armed swamp troll with mossy teal hide, upturned tusks, a flaming mohawk, long swept ears, and bone fetishes: a skull necklace, bone bracers and a skull-studded belt.",
};

const IVORY = "#efe2b8", IVORY_D = "#b9a574", LEATHER = "#5a3a22", LEATHER_D = "#3a2414";
const RED = "#c2261f", ORANGE = "#ff8a22", PURPLE = "#6a2a8a", YELLOW = "#ffe14a", DARK = "#1a1010", CLAW = "#2b2118";

const base = mottle("#3b7a72", "#5fae8d", { size: 0.14, contrast: 0.7, seed: 3 });
const SKIN = paint((p, n) => {
  let c = resolve(base, p, n);
  c = mix(c, "#9ac48a", smoothstep(-0.1, -0.8, n.y) * 0.5);
  c = mix(c, "#2e5a4c", smoothstep(0.55, 0.8, noise(p, 0.1, 7)) * 0.35);
  c = mix(c, "#4b4a2a", smoothstep(0.3, 0.05, p.y) * 0.6);
  c = mix(c, "#7bc7a0", smoothstep(0.6, 1, n.y) * 0.2);
  return c;
});
const MOHAWK = paint((_p, _n, s) => mix(mix(RED, "#7a1010", 0.4), ORANGE, smoothstep(0.02, 0.2, s[1])));
const CLOTH = paint((p) => (Math.sin(p.x * 55) > 0.7 ? "#e0b030" : Math.abs(Math.sin(p.y * 30)) > 0.93 ? PURPLE : LEATHER));

const WAR = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 14 L32 34 L54 14" stroke="#6a2a8a" stroke-width="7"/>
  <path d="M14 40 L32 58 L50 40" stroke="#c2261f" stroke-width="6"/>
  <path d="M32 6 L32 34" stroke="#efe2b8" stroke-width="4"/>
  <circle cx="32" cy="34" r="6" fill="#efe2b8" stroke="#1a1010" stroke-width="2"/></g></svg>`,
  { size: 192 },
);
const FACE = svg(
  `<svg viewBox="0 0 64 24"><g stroke-linecap="round" fill="none"><path d="M6 6 L22 20 M12 4 L26 16" stroke="#6a2a8a" stroke-width="3"/>
  <path d="M58 6 L42 20 M52 4 L38 16" stroke="#6a2a8a" stroke-width="3"/><path d="M32 4 L32 22" stroke="#efe2b8" stroke-width="3"/></g></svg>`,
  { size: 192 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 24 64"><path d="M12 63 C1 46 1 16 12 1 C23 16 23 46 12 63Z" fill="#ffffff"/><path d="M12 60 L12 8" stroke="#bbbbbb" stroke-width="2"/></svg>`,
  { size: 128 },
);

function loop(c: number[], rx: number, rz: number, n: number): number[][] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [c[0] + Math.sin(a) * rx, c[1], c[2] + Math.cos(a) * rz];
  });
}

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 1024 });
  const R = rng(9);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.0, 0], [0, 1.3, 0.1], [0, 1.6, 0.22], [0, 1.82, 0.3]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 1.8, 0.3], [0, 1.88, 0.4], [0, 1.96, 0.5]]), {
    parent: chest, names: ["neck1", "neck2"], role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.96, 0.5], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.93, 0.6], aim: [0, 1.9, 0.78], role: "jaw" });

  const legs: any = {}, arms: any = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const lp = limb([s * 0.2, 1.0, -0.02], [s * 0.27, 0.07, 0.1], [0.52, 0.5], [0, 0, 1]);
    legs[L] = b.chain(`leg${L}`, lp, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg", contact: [s * 0.27, 0, 0.1] });
    const ap = limb([s * 0.4, 1.74, 0.25], [s * 0.58, 0.78, 0.5], [0.56, 0.56], [0, 0, -1]);
    arms[L] = b.chain(`arm${L}`, ap, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" });
  }

  // ---------------- torso
  const torso = b.loft(
    [
      { at: [0, 1.0, 0], w: 0.5, h: 0.36 },
      { at: [0, 1.3, 0.1], w: 0.56, h: 0.42 },
      { at: [0, 1.6, 0.22], w: 0.84, h: 0.5 },
      { at: [0, 1.82, 0.3], w: 0.52, h: 0.4 },
    ],
    { bone: [spine, hips], color: SKIN, sides: 10 },
  );
  const skin = b.surface(torso);
  // hump
  b.part(new THREE.SphereGeometry(0.3, 9, 7), SKIN, { bone: chest, at: [0, 1.8, 0.0], scale: [1.2, 0.8, 1] });
  b.decal(torso, WAR, { at: [0, 1.5, 0.5], dir: [0, 0, 1], size: [0.4, 0.4], bone: chest });
  for (const h of skin.scatter(26, { rng: R, minDist: 0.1, filter: (h) => h.at.y > 1.1 }))
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), "#6f9a5a", h, { embed: 0.4 });
  // spine bone spikes
  b.along(catmull([[0, 1.95, 0.0], [0, 1.7, -0.14], [0, 1.4, -0.12], [0, 1.1, -0.1]]), 5, (at) =>
    b.spike(at, [0, 0.8, -0.6], 0.12, 0.03, { color: IVORY_D, bone: chest }),
  );

  // neck
  b.sweep(neck, [0.14, 0.12], { color: SKIN });

  // ---------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), SKIN, { bone: head, at: [0, 2.0, 0.62], scale: [0.15, 0.14, 0.18] });
  b.part(new THREE.SphereGeometry(1, 9, 7), SKIN, { bone: head, at: [0, 1.95, 0.72], scale: [0.12, 0.07, 0.1] });
  b.part(new THREE.SphereGeometry(1, 10, 7), SKIN, { bone: jaw, at: [0, 1.9, 0.68], scale: [0.115, 0.055, 0.14] });
  b.part(new THREE.SphereGeometry(1, 6, 5), "#7a2a30", { bone: jaw, at: [0, 1.935, 0.7], scale: [0.08, 0.02, 0.1] });
  b.decal(skull, FACE, { at: [0, 1.99, 0.8], dir: [0, 0, 1], size: [0.24, 0.09], bone: head });
  // nose
  b.spike([0, 2.0, 0.76], [0, -0.45, 1], 0.12, 0.04, { color: SKIN, bone: head, sides: 6 });
  // brow
  b.capsule([-0.13, 2.07, 0.7], [0.13, 2.07, 0.7], 0.035, { color: "#2e5a4c", bone: head, sides: 6 });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.025, 7, 5), YELLOW, { bone: head, at: [s * 0.075, 2.03, 0.76] }), 1.4);
    b.part(new THREE.SphereGeometry(0.01, 5, 4), DARK, { bone: head, at: [s * 0.075, 2.03, 0.783] });
    b.capsule([s * 0.14, 2.06, 0.7], [s * 0.04, 2.1, 0.78], 0.014, { color: "#2e5a4c", bone: head, sides: 5 });
    // tusks
    const tusk = bezier([s * 0.07, 1.9, 0.76], [s * 0.1, 1.9, 0.84], [s * 0.13, 2.0, 0.86], [s * 0.11, 2.14, 0.82]);
    b.sweep(tusk, [0.036, 0.0], { bone: jaw, color: IVORY, sides: 6, caps: { start: "flat", end: "point" } });
    b.rod([s * 0.085, 1.915, 0.8], [s * 0.1, 1.95, 0.8], 0.045, { bone: jaw, color: "#b8742f", sides: 6 });
    // small upper fangs
    b.spike([s * 0.04, 1.92, 0.8], [0, -1, 0.1], 0.04, 0.012, { bone: head, color: IVORY, sides: 5 });
    // ears
    const ear = b.chain(`ear${s > 0 ? "L" : "R"}`, catmull([[s * 0.13, 2.04, 0.58], [s * 0.3, 2.07, 0.5], [s * 0.52, 2.2, 0.38]]), {
      parent: head, count: 2,
    });
    b.sweep(ear, (t) => [0.05 * (1 - t) + 0.006, 0.012], { color: SKIN, caps: "point", sides: 6 });
    // ear rings
    const ep = ear.at(0.45);
    b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), "#d9a438", { bone: ear.joints[0], at: ep.at, dir: ep.tangent, axis: "z" });
  }

  // mohawk
  const crest = catmull([[0, 2.13, 0.74], [0, 2.16, 0.6], [0, 2.1, 0.46], [0, 2.0, 0.36], [0, 1.9, 0.3]]);
  let mi = 0;
  b.along(crest, 11, (at) => {
    const h = 0.2 + 0.12 * Math.sin((mi / 10) * Math.PI) + (R() - 0.5) * 0.04;
    mi++;
    b.extrude([[-0.06, 0], [0.06, 0], [0.04, h * 0.6], [0, h, "sharp"], [-0.03, h * 0.7]], {
      at, x: [0, 0, -1], y: [0, 1, -0.5], thickness: [0.035, 0.008], bevel: 0.005, color: MOHAWK, bone: head,
    });
  });
  // bone beads in mohawk
  for (const t of [0.25, 0.6]) {
    const p = crest.at(t);
    b.part(new THREE.SphereGeometry(0.02, 6, 4), IVORY, { bone: head, at: [p.x + 0.04, p.y + 0.01, p.z] });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), IVORY, { bone: head, at: [p.x - 0.04, p.y + 0.01, p.z] });
  }

  // ---------------- skull fetish helper
  const skullFetish = (at: number[], r: number, bone: any, rot = 0) => {
    const o = { bone, rotation: [0, rot, 0] as [number, number, number] };
    b.part(new THREE.SphereGeometry(r, 8, 6), IVORY, { ...o, at, scale: [1, 1.05, 1.05] });
    b.part(new THREE.BoxGeometry(r * 1.2, r * 0.5, r * 1.0), IVORY_D, { ...o, at: [at[0], at[1] - r * 0.85, at[2] + r * 0.2] });
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(r * 0.28, 5, 4), DARK, { bone, at: [at[0] + s * r * 0.4, at[1] + r * 0.1, at[2] + r * 0.86] });
    b.part(new THREE.ConeGeometry(r * 0.12, r * 0.3, 4), DARK, { bone, at: [at[0], at[1] - r * 0.25, at[2] + r * 0.95], rotation: [180, 0, 0] });
  };
  const boneItem = (at: number[], len: number, bone: any) => {
    b.rod([at[0], at[1] + len / 2, at[2]], [at[0], at[1] - len / 2, at[2]], 0.012, IVORY, { bone, sides: 5 });
    for (const y of [len / 2, -len / 2])
      for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.016, 5, 4), IVORY, { bone, at: [at[0] + s * 0.01, at[1] + y, at[2]] });
  };

  // necklace
  const neckLoop = catmull(
    [[0.2, 1.9, 0.12], [0.24, 1.78, 0.4], [0.1, 1.66, 0.54], [0, 1.6, 0.56], [-0.1, 1.66, 0.54], [-0.24, 1.78, 0.4], [-0.2, 1.9, 0.12], [0, 1.96, 0.04]],
    { closed: true },
  );
  b.sweep(neckLoop, 0.012, { color: LEATHER_D, bone: chest, sides: 5 });
  let bi = 0;
  b.along(neckLoop, 12, (at: any) => {
    if (at.at.z < 0.3 || at.at.y > 1.85) return;
    bi++;
    if (bi % 2) b.part(new THREE.SphereGeometry(0.028, 6, 4), "#d9a438", { bone: chest, at: at.at.clone().add(new THREE.Vector3(0, -0.02, 0.0)) });
    else boneItem([at.at.x, at.at.y - 0.07, at.at.z + 0.02], 0.1, chest);
  });
  skullFetish([0, 1.5, 0.58], 0.065, chest);
  b.rod([0, 1.6, 0.56], [0, 1.55, 0.58], 0.008, LEATHER_D, { bone: chest, sides: 4 });

  // ---------------- belt and loincloth
  const belt = catmull(loop([0, 1.05, 0.01], 0.3, 0.24, 12), { closed: true });
  b.sweep(belt, [0.03, 0.04], { color: LEATHER, bone: hips, sides: 6, section: "box" });
  b.along(belt, 12, (at: any) => b.part(new THREE.SphereGeometry(0.014, 5, 4), "#d9a438", { at, bone: hips }));
  skullFetish([0.0, 1.05, 0.28], 0.05, hips);
  for (const s of [1, -1]) {
    skullFetish([s * 0.26, 1.05, 0.14], 0.035, hips, s * 50);
    b.extrude(
      [[-0.12, 0], [0.12, 0], [0.12, -0.34], [0.06, -0.3, "sharp"], [0, -0.4, "sharp"], [-0.06, -0.3, "sharp"], [-0.12, -0.34]],
      { at: [s * 0.13, 1.03, 0.26], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: CLOTH, bone: hips },
    );
  }
  b.extrude([[-0.2, 0], [0.2, 0], [0.18, -0.45], [0, -0.55, "sharp"], [-0.18, -0.45]], {
    at: [0, 1.03, -0.22], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, color: CLOTH, bone: hips,
  });
  for (let i = -3; i <= 3; i++)
    b.cards([frame([i * 0.07, 1.03, 0.25 + (i % 2) * 0.01], [0, 1, 0])], FEATHER, {
      size: [0.04, 0.16], lean: 180, flow: [0, 0, 1], color: i % 2 ? RED : PURPLE, bone: hips,
    });

  // ---------------- legs & feet
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = legs[L];
    b.sweep(leg, [0.15, 0.11, 0.09, 0.07], { color: SKIN, sides: 8 });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), SKIN, { bone: leg.joints[1], at: leg.joints[1].at });
    const ft = leg.tip ?? leg.joints[2];
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: ft, at: [s * 0.27, 0.06, 0.1], scale: [0.1, 0.06, 0.15] });
    for (const k of [-1, 0, 1]) {
      b.spike([s * 0.27 + k * 0.05, 0.06, 0.2], [k * 0.15, -0.15, 1], 0.1, 0.03, { color: SKIN, bone: ft, sides: 6 });
      b.spike([s * 0.27 + k * 0.05 + k * 0.012, 0.055, 0.3], [k * 0.15, -0.2, 1], 0.05, 0.016, { color: CLAW, bone: ft, sides: 5 });
    }
    // ankle bone cuff
    b.rod([s * 0.26, 0.2, 0.08], [s * 0.26, 0.26, 0.08], 0.075, LEATHER, { bone: ft, sides: 8 });
    b.spike([s * 0.33, 0.24, 0.08], [s, 0.3, 0], 0.08, 0.02, { color: IVORY, bone: ft, sides: 5 });
  }

  // ---------------- arms & hands
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const arm = arms[L];
    b.sweep(arm, [0.12, 0.1, 0.08, 0.07], { color: SKIN, sides: 8 });
    const hand = arm.tip ?? arm.joints[2];
    const hp = hand.at;
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { bone: hand, at: [hp.x, hp.y - 0.04, hp.z], scale: [0.09, 0.1, 0.08] });
    for (const k of [-1, 0, 1]) {
      const f = b.chain(`finger${L}${k + 2}`, catmull([[hp.x + k * 0.04, hp.y - 0.1, hp.z + 0.02], [hp.x + k * 0.05, hp.y - 0.2, hp.z + 0.06], [hp.x + k * 0.05, hp.y - 0.27, hp.z + 0.12]]), {
        parent: hand, count: 2, role: "digit",
      });
      b.sweep(f, [0.025, 0.018], { color: SKIN, sides: 6 });
      b.spike(f.tip ?? f.joints[1], [0, -0.5, 1], 0.06, 0.014, { color: CLAW, sides: 5 });
    }
    b.spike([hp.x + s * 0.08, hp.y - 0.05, hp.z + 0.02], [s, -0.5, 0.5], 0.09, 0.024, { color: SKIN, bone: hand, sides: 6 });
    // bone bracer
    const cuff = arm.at(0.78);
    b.sweep(arm, [0.086, 0.08], { from: 0.68, to: 0.86, color: LEATHER, sides: 8, caps: "flat" });
    b.ring(cuff, { count: 5, radius: 0.085 }, (item: any) => b.spike(item, item, 0.075, 0.018, { color: IVORY, sides: 5 }));
    // shoulder
    b.part(new THREE.SphereGeometry(0.15, 8, 6), SKIN, { bone: arm.joints[0], at: arm.joints[0].at, scale: [1, 0.9, 1] });
    b.spike([s * 0.45, 1.85, 0.22], [s * 0.5, 1, -0.2], 0.2, 0.04, { color: IVORY, bone: arm.joints[0], sides: 6 });
    boneItem([s * 0.5, 1.5, 0.18], 0.12, arm.joints[1]);
    b.rod([s * 0.48, 1.76, 0.2], [s * 0.5, 1.56, 0.18], 0.007, LEATHER_D, { bone: arm.joints[1], sides: 4 });
  }

  return b.root;
}
```