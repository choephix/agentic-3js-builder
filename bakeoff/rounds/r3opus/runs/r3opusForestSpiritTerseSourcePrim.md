```ts
import * as THREE from "three";
import { createBuilder, frame, rng, grain, mottle, paint, noise, svg } from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small woodland spirit with a bark body and a moss mantle. It wears a bone-white mask with ochre markings and glowing eyes, and its antlers are branches tipped with leaves. A leaf skirt and leaf cape hang from it, glowing mushrooms grow on it, and a luminous rune marks its chest. It stands in a rigging rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit", paintSize: 1024 });

  // ---------- palette ----------
  const BARK = "#6b4a32";
  const BARK_D = "#3f2a1d";
  const MOSS = "#5f8f3a";
  const MOSS_L = "#8cbc4c";
  const BONE = "#efe6cf";
  const BONE_D = "#dacdb0";
  const INK = "#1b1714";
  const GLOW = "#d8ff6a";
  const SHROOM = "#62e0cf";
  const STEM = "#efe3c4";

  const glowM = b.material(GLOW);
  glowM.emissive.set(GLOW);
  glowM.emissiveIntensity = 1.4;
  const shroomM = b.material(SHROOM);
  shroomM.emissive.set(SHROOM);
  shroomM.emissiveIntensity = 0.9;

  const moss = mottle(MOSS, MOSS_L, { size: 0.05, seed: 2 });
  const barkV = grain(BARK, BARK_D, { size: 0.015, axis: "y", seed: 1 });
  const barkH = grain(BARK, BARK_D, { size: 0.015, axis: "x", seed: 3 });
  const torsoPaint = paint((p, n) => (noise(p, 0.07, 4) + n.y * 0.45 + (p.y - 0.85) * 2 > 0.9 ? moss : barkV));
  const legPaint = paint((p) => (noise(p, 0.05, 7) > 0.68 ? moss : barkV));
  const armPaint = paint((p) => (noise(p, 0.05, 8) > 0.68 ? moss : barkH));

  // ---------- textures ----------
  const leafSvg = (fill: string, rib: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><path d="M32 126 C10 100 4 46 32 4 C60 46 54 100 32 126 Z" fill="${fill}"/><path d="M32 124 L32 12" stroke="${rib}" stroke-width="3" fill="none"/><path d="M32 92 L16 76 M32 92 L48 76 M32 66 L18 50 M32 66 L46 50 M32 42 L24 30 M32 42 L40 30" stroke="${rib}" stroke-width="2" fill="none"/></svg>`;
  const leafA = svg(leafSvg("#6fa83e", "#a9d46a"), { size: 128 });
  const leafB = svg(leafSvg("#4f8a34", "#86b85a"), { size: 128 });
  const leafC = svg(leafSvg("#c9a23a", "#ead27a"), { size: 128 });
  const leaves = [leafA, leafA, leafB, leafB, leafC];

  const runeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 32 m0 -3 a3 3 0 1 1 -3 3 a7 7 0 0 1 7 -7 a11 11 0 0 1 11 11 a15 15 0 0 1 -15 15 a19 19 0 0 1 -19 -19 a23 23 0 0 1 23 -23" stroke="#c8ff6a" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="6" r="3" fill="#c8ff6a"/><circle cx="58" cy="40" r="2.5" fill="#c8ff6a"/><circle cx="8" cy="44" r="2.5" fill="#c8ff6a"/></svg>`,
    { size: 128 },
  );
  const markTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115"><g fill="#b8452e"><circle cx="50" cy="22" r="4"/><circle cx="42" cy="32" r="3"/><circle cx="58" cy="32" r="3"/><path d="M50 38 C44 44 44 50 50 56 C56 50 56 44 50 38 Z"/></g><g stroke="#b8452e" stroke-width="3" stroke-linecap="round" fill="none"><path d="M23 66 L22 84"/><path d="M29 67 L29 90"/><path d="M35 66 L36 82"/><path d="M65 66 L64 82"/><path d="M71 67 L71 90"/><path d="M77 66 L78 84"/></g></svg>`,
    { size: 256 },
  );

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.62, 0], dir: [0, 1, 0] });
  b.chain("spine", [[0, 0.64, 0], [0, 0.8, 0.005], [0, 0.97, 0]], {
    parent: "hips",
    names: ["spine", "chest"],
    role: "spine",
  });
  b.chain("neck", [[0, 0.97, 0], [0, 1.1, 0.02]], { parent: "chest", names: ["neck", "head"], role: "neck" });
  b.joint("jaw", { parent: "head", at: [0, 1.12, 0.05], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", [[0, 0.64, -0.1], [0, 0.6, -0.22], [0, 0.66, -0.33], [0, 0.78, -0.37]], {
    parent: "hips",
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  // ---------- helpers ----------
  const mushroom = (at: number[], dir: number[], s: number, bone: string) => {
    const base = new THREE.Vector3(at[0], at[1], at[2]);
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const top = base.clone().addScaledVector(d, 0.05 * s);
    b.rod(base, top, 0.008 * s, { color: STEM, bone });
    b.part(new THREE.SphereGeometry(0.028 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), SHROOM, { at: top, dir: d, bone });
    b.part(new THREE.CylinderGeometry(0.027 * s, 0.02 * s, 0.006 * s, 8), STEM, { at: top, dir: d, bone });
  };

  // ---------- torso ----------
  b.lathe(
    [[0, -0.05], [0.1, -0.04], [0.145, 0.04], [0.15, 0.14], [0.14, 0.22], [0, 0.22]],
    { at: [0, 0.6, 0], color: torsoPaint, segments: 9, bone: "spine" },
  );
  const upper = b.lathe(
    [[0, 0.18], [0.14, 0.18], [0.155, 0.26], [0.165, 0.32], [0.13, 0.39], [0.05, 0.42], [0, 0.42]],
    { at: [0, 0.6, 0], color: torsoPaint, segments: 9, bone: "chest" },
  );
  const rune = b.decal(upper, runeTex, { at: [0, 0.86, 0.16], dir: [0, 0, 1], size: [0.12, 0.12] });
  const runeM = rune.mesh.material as THREE.MeshStandardMaterial;
  runeM.emissive.set("#ffffff");
  runeM.emissiveMap = runeTex;
  runeM.emissiveIntensity = 1.0;

  const mantle = b.part(new THREE.SphereGeometry(0.2, 12, 8), moss, {
    at: [0, 0.99, -0.01],
    scale: [1.05, 0.45, 0.95],
    bone: "chest",
  });
  const capeHits = b.surface(mantle).scatter(38, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.2 && h.n.z < 0.55,
  });
  b.cards(capeHits, leaves, {
    size: [0.075, 0.13],
    lean: 70,
    flow: [0, -1, -0.2],
    bend: 20,
    vary: 0.25,
    spin: 20,
    rng: rng(12),
    bone: "chest",
  });

  // leaf skirt in two tiers
  const skirt1 = b.ring(frame([0, 0.63, 0], [0, 1, 0]), { count: 16, radius: 0.135 }).items;
  const skirt2 = b.ring(frame([0, 0.57, 0], [0, 1, 0]), { count: 14, radius: 0.115, fromDeg: 12, toDeg: 372 }).items;
  b.cards([...skirt1, ...skirt2], leaves, {
    size: [0.09, 0.17],
    lean: 78,
    flow: [0, -1, 0],
    bend: 15,
    vary: 0.2,
    spin: 10,
    rng: rng(13),
    bone: "hips",
  });

  // neck
  b.capsule([0, 0.98, 0], [0, 1.12, 0.02], { radius: 0.05, color: moss, bone: "neck" });

  // ---------- head ----------
  const hood = b.part(new THREE.SphereGeometry(0.17, 12, 9), moss, {
    at: [0, 1.24, -0.01],
    scale: [1, 1, 1.05],
    bone: "head",
  });
  const mask = b.part(new THREE.SphereGeometry(0.15, 14, 10), BONE, {
    at: [0, 1.25, 0.1],
    scale: [1, 1.15, 0.5],
    bone: "head",
  });
  b.decal(mask, markTex, { at: [0, 1.25, 0.175], dir: [0, 0, 1], size: [0.26, 0.3] });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 10, 8), INK, {
      at: [0.055 * sx, 1.26, 0.168],
      scale: [1, 1.3, 0.4],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), GLOW, { at: [0.055 * sx, 1.255, 0.18], bone: "head" });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), INK, { at: [0.012 * sx, 1.2, 0.176], bone: "head" });
  }
  // mouth interior and lower jaw
  b.part(new THREE.SphereGeometry(0.05, 10, 6), INK, { at: [0, 1.1, 0.13], scale: [1, 0.5, 0.6], bone: "head" });
  b.part(new THREE.SphereGeometry(0.075, 10, 6), BONE_D, {
    at: [0, 1.075, 0.12],
    scale: [1, 0.55, 0.75],
    bone: "jaw",
  });
  for (const sx of [1, -1])
    b.part(new THREE.ConeGeometry(0.008, 0.02, 5), BONE, { at: [0.03 * sx, 1.1, 0.163], bone: "jaw" });

  // leaf crown on the hood
  const crown = b.surface(hood).scatter(22, {
    rng: rng(5),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.25 && h.at.z < 0.06,
  });
  b.cards(crown, leaves, {
    size: [0.06, 0.1],
    lean: 35,
    flow: [0, 0.3, -1],
    bend: 25,
    vary: 0.25,
    spin: 25,
    rng: rng(9),
    bone: "head",
  });
  mushroom([-0.12, 1.34, -0.05], [-0.6, 1, -0.2], 1.1, "head");
  mushroom([-0.09, 1.36, -0.09], [-0.3, 1, -0.4], 0.7, "head");

  // ---------- antlers, arms, legs ----------
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    const A = (x: number, y: number, z: number) => [x * sx, y, z];

    // antlers
    const ant = { color: BARK_D, bone: "head" };
    b.capsule(A(0.07, 1.33, -0.03), A(0.15, 1.47, -0.06), { radius: [0.022, 0.016], ...ant });
    b.capsule(A(0.15, 1.47, -0.06), A(0.2, 1.62, -0.03), { radius: [0.016, 0.008], ...ant });
    b.capsule(A(0.15, 1.47, -0.06), A(0.26, 1.52, 0.0), { radius: [0.012, 0.006], ...ant });
    b.capsule(A(0.18, 1.55, -0.045), A(0.13, 1.66, -0.02), { radius: [0.01, 0.005], ...ant });
    b.capsule(A(0.11, 1.4, -0.045), A(0.2, 1.42, 0.04), { radius: [0.01, 0.005], ...ant });
    b.cards(
      [
        frame(A(0.2, 1.62, -0.03), [0.3 * sx, 1, 0.1]),
        frame(A(0.26, 1.52, 0.0), [1 * sx, 0.5, 0.2]),
        frame(A(0.13, 1.66, -0.02), [-0.2 * sx, 1, 0.1]),
        frame(A(0.2, 1.42, 0.04), [0.6 * sx, 0.3, 1]),
      ],
      leaves,
      { size: [0.05, 0.09], bend: 20, vary: 0.2, spin: 30, rng: rng(sx > 0 ? 21 : 22), bone: "head" },
    );

    // arm
    const arm = b.chain(`arm${s}`, [A(0.12, 0.93, 0), A(0.32, 0.92, 0), A(0.5, 0.91, 0), A(0.56, 0.91, 0)], {
      parent: "chest",
      names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`],
      role: "arm",
    });
    b.sweep(arm, { radius: [0.05, 0.038, 0.03, 0.03], color: armPaint });
    b.part(new THREE.SphereGeometry(0.075, 10, 7), moss, {
      at: A(0.15, 0.97, 0),
      scale: [1, 0.7, 1],
      bone: `shoulder${s}`,
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), BARK_D, { at: A(0.32, 0.92, 0), bone: `elbow${s}` });
    b.ring(frame(A(0.47, 0.912, 0), [sx, 0, 0]), { count: 7, radius: 0.034 }, (item) =>
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GLOW, { at: item.at, bone: `elbow${s}` }),
    );
    b.part(new THREE.SphereGeometry(0.045, 10, 7), BARK, {
      at: A(0.555, 0.91, 0),
      scale: [1, 0.6, 1],
      bone: `wrist${s}`,
    });
    const fingerDirs = [
      [1, -0.05, 0.55],
      [1, -0.05, 0],
      [1, -0.05, -0.55],
      [0.4, -0.05, 1],
    ];
    fingerDirs.forEach((fd, i) => {
      const d = new THREE.Vector3(fd[0] * sx, fd[1], fd[2]).normalize();
      const base = new THREE.Vector3(0.575 * sx, 0.91, i === 3 ? 0.03 : 0.028 * (1 - i));
      const len = i === 3 ? 0.06 : 0.09;
      const p1 = base.clone().addScaledVector(d, len / 2);
      const p2 = p1.clone().addScaledVector(d, len / 2).add(new THREE.Vector3(0, -0.008, 0));
      const finger = b.chain(`finger${i + 1}${s}`, [base, p1, p2], {
        parent: `wrist${s}`,
        names: [`finger${i + 1}a${s}`, `finger${i + 1}b${s}`],
        role: "digit",
      });
      b.sweep(finger, { radius: [0.014, 0.011, 0.005], color: BARK_D });
    });

    // leg
    b.chain(`leg${s}`, [A(0.08, 0.6, 0), A(0.1, 0.33, 0.03), A(0.1, 0.09, 0)], {
      parent: "hips",
      names: [`hip${s}`, `knee${s}`, `ankle${s}`],
      role: "leg",
      contact: A(0.1, 0, 0.04),
    });
    const legChain = b.chain(`legSkin${s}`, [A(0.08, 0.6, 0), A(0.1, 0.33, 0.03), A(0.1, 0.09, 0)], {
      parent: `hip${s}`,
      count: 0 || undefined,
    });
    void legChain;
  }

  // ---------- tail ----------
  b.sweep(tail, { radius: [0.045, 0.035, 0.022, 0.01], color: legPaint });
  const tip = [0, 0.78, -0.37];
  b.cards(
    [
      frame(tip, [0.5, 1, -0.4]),
      frame(tip, [-0.5, 1, -0.4]),
      frame(tip, [0, 1, -0.7]),
      frame(tip, [0, 0.6, -1]),
      frame(tip, [0.3, 0.4, -1]),
    ],
    leaves,
    { size: [0.07, 0.13], bend: 20, vary: 0.2, rng: rng(31), bone: "tail3" },
  );

  mushroom([0.16, 1.01, 0.01], [0.3, 1, 0.1], 1.0, "shoulderL");
  mushroom([0.19, 1.0, -0.03], [0.6, 1, -0.2], 0.65, "shoulderL");
  mushroom([0.13, 1.0, 0.04], [-0.1, 1, 0.5], 0.55, "shoulderL");

  return b.root;
}
```

Wait, the leg geometry is missing. A second chain duplicates joints, and the leg itself needs a sweep. The corrected module is below:

```ts
import * as THREE from "three";
import { createBuilder, frame, rng, grain, mottle, paint, noise, svg } from "agentic-3js-builder";

export const meta = {
  name: "Forest Spirit",
  description:
    "A small woodland spirit with a bark body and a moss mantle. It wears a bone-white mask with ochre markings and glowing eyes, and its antlers are branches tipped with leaves. A leaf skirt and leaf cape hang from it, glowing mushrooms grow on it, and a luminous rune marks its chest. It stands in a rigging rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit", paintSize: 1024 });

  const BARK = "#6b4a32";
  const BARK_D = "#3f2a1d";
  const MOSS = "#5f8f3a";
  const MOSS_L = "#8cbc4c";
  const BONE = "#efe6cf";
  const BONE_D = "#dacdb0";
  const INK = "#1b1714";
  const GLOW = "#d8ff6a";
  const SHROOM = "#62e0cf";
  const STEM = "#efe3c4";

  const glowM = b.material(GLOW);
  glowM.emissive.set(GLOW);
  glowM.emissiveIntensity = 1.4;
  const shroomM = b.material(SHROOM);
  shroomM.emissive.set(SHROOM);
  shroomM.emissiveIntensity = 0.9;

  const moss = mottle(MOSS, MOSS_L, { size: 0.05, seed: 2 });
  const barkV = grain(BARK, BARK_D, { size: 0.015, axis: "y", seed: 1 });
  const barkH = grain(BARK, BARK_D, { size: 0.015, axis: "x", seed: 3 });
  const torsoPaint = paint((p, n) => (noise(p, 0.07, 4) + n.y * 0.45 + (p.y - 0.85) * 2 > 0.9 ? moss : barkV));
  const legPaint = paint((p) => (noise(p, 0.05, 7) > 0.68 ? moss : barkV));
  const armPaint = paint((p) => (noise(p, 0.05, 8) > 0.68 ? moss : barkH));

  const leafSvg = (fill: string, rib: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><path d="M32 126 C10 100 4 46 32 4 C60 46 54 100 32 126 Z" fill="${fill}"/><path d="M32 124 L32 12" stroke="${rib}" stroke-width="3" fill="none"/><path d="M32 92 L16 76 M32 92 L48 76 M32 66 L18 50 M32 66 L46 50 M32 42 L24 30 M32 42 L40 30" stroke="${rib}" stroke-width="2" fill="none"/></svg>`;
  const leafA = svg(leafSvg("#6fa83e", "#a9d46a"), { size: 128 });
  const leafB = svg(leafSvg("#4f8a34", "#86b85a"), { size: 128 });
  const leafC = svg(leafSvg("#c9a23a", "#ead27a"), { size: 128 });
  const leaves = [leafA, leafA, leafB, leafB, leafC];

  const runeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 32 m0 -3 a3 3 0 1 1 -3 3 a7 7 0 0 1 7 -7 a11 11 0 0 1 11 11 a15 15 0 0 1 -15 15 a19 19 0 0 1 -19 -19 a23 23 0 0 1 23 -23" stroke="#c8ff6a" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="6" r="3" fill="#c8ff6a"/><circle cx="58" cy="40" r="2.5" fill="#c8ff6a"/><circle cx="8" cy="44" r="2.5" fill="#c8ff6a"/></svg>`,
    { size: 128 },
  );
  const markTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 115"><g fill="#b8452e"><circle cx="50" cy="22" r="4"/><circle cx="42" cy="32" r="3"/><circle cx="58" cy="32" r="3"/><path d="M50 38 C44 44 44 50 50 56 C56 50 56 44 50 38 Z"/></g><g stroke="#b8452e" stroke-width="3" stroke-linecap="round" fill="none"><path d="M23 66 L22 84"/><path d="M29 67 L29 90"/><path d="M35 66 L36 82"/><path d="M65 66 L64 82"/><path d="M71 67 L71 90"/><path d="M77 66 L78 84"/></g></svg>`,
    { size: 256 },
  );

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.62, 0], dir: [0, 1, 0] });
  b.chain("spine", [[0, 0.64, 0], [0, 0.8, 0.005], [0, 0.97, 0]], {
    parent: "hips",
    names: ["spine", "chest"],
    role: "spine",
  });
  b.chain("neck", [[0, 0.97, 0], [0, 1.1, 0.02]], { parent: "chest", names: ["neck", "head"], role: "neck" });
  b.joint("jaw", { parent: "head", at: [0, 1.12, 0.05], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", [[0, 0.64, -0.1], [0, 0.6, -0.22], [0, 0.66, -0.33], [0, 0.78, -0.37]], {
    parent: "hips",
    names: ["tail1", "tail2", "tail3"],
    role: "tail",
  });

  const mushroom = (at: number[], dir: number[], s: number, bone: string) => {
    const base = new THREE.Vector3(at[0], at[1], at[2]);
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    const top = base.clone().addScaledVector(d, 0.05 * s);
    b.rod(base, top, 0.008 * s, { color: STEM, bone });
    b.part(new THREE.SphereGeometry(0.028 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), SHROOM, { at: top, dir: d, bone });
    b.part(new THREE.CylinderGeometry(0.027 * s, 0.02 * s, 0.006 * s, 8), STEM, { at: top, dir: d, bone });
  };

  // ---------- torso ----------
  b.lathe([[0, -0.05], [0.1, -0.04], [0.145, 0.04], [0.15, 0.14], [0.14, 0.22], [0, 0.22]], {
    at: [0, 0.6, 0],
    color: torsoPaint,
    segments: 9,
    bone: "spine",
  });
  const upper = b.lathe(
    [[0, 0.18], [0.14, 0.18], [0.155, 0.26], [0.165, 0.32], [0.13, 0.39], [0.05, 0.42], [0, 0.42]],
    { at: [0, 0.6, 0], color: torsoPaint, segments: 9, bone: "chest" },
  );
  const rune = b.decal(upper, runeTex, { at: [0, 0.86, 0.16], dir: [0, 0, 1], size: [0.12, 0.12] });
  const runeM = rune.mesh.material as THREE.MeshStandardMaterial;
  runeM.emissive.set("#ffffff");
  runeM.emissiveMap = runeTex;
  runeM.emissiveIntensity = 1.0;

  const mantle = b.part(new THREE.SphereGeometry(0.2, 12, 8), moss, {
    at: [0, 0.99, -0.01],
    scale: [1.05, 0.45, 0.95],
    bone: "chest",
  });
  const capeHits = b.surface(mantle).scatter(38, {
    rng: rng(11),
    minDist: 0.03,
    filter: (h) => h.n.y > -0.2 && h.n.z < 0.55,
  });
  b.cards(capeHits, leaves, {
    size: [0.075, 0.13],
    lean: 70,
    flow: [0, -1, -0.2],
    bend: 20,
    vary: 0.25,
    spin: 20,
    rng: rng(12),
    bone: "chest",
  });

  const skirt1 = b.ring(frame([0, 0.63, 0], [0, 1, 0]), { count: 16, radius: 0.135 }).items;
  const skirt2 = b.ring(frame([0, 0.57, 0], [0, 1, 0]), { count: 14, radius: 0.115, fromDeg: 12, toDeg: 372 }).items;
  b.cards([...skirt1, ...skirt2], leaves, {
    size: [0.09, 0.17],
    lean: 78,
    flow: [0, -1, 0],
    bend: 15,
    vary: 0.2,
    spin: 10,
    rng: rng(13),
    bone: "hips",
  });

  b.capsule([0, 0.98, 0], [0, 1.12, 0.02], { radius: 0.05, color: moss, bone: "neck" });

  // ---------- head ----------
  const hood = b.part(new THREE.SphereGeometry(0.17, 12, 9), moss, {
    at: [0, 1.24, -0.01],
    scale: [1, 1, 1.05],
    bone: "head",
  });
  const mask = b.part(new THREE.SphereGeometry(0.15, 14, 10), BONE, {
    at: [0, 1.25, 0.1],
    scale: [1, 1.15, 0.5],
    bone: "head",
  });
  b.decal(mask, markTex, { at: [0, 1.25, 0.175], dir: [0, 0, 1], size: [0.26, 0.3] });
  for (const sx of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 10, 8), INK, {
      at: [0.055 * sx, 1.26, 0.168],
      scale: [1, 1.3, 0.4],
      bone: "head",
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), GLOW, { at: [0.055 * sx, 1.255, 0.18], bone: "head" });
    b.part(new THREE.SphereGeometry(0.006, 6, 4), INK, { at: [0.012 * sx, 1.2, 0.176], bone: "head" });
  }
  b.part(new THREE.SphereGeometry(0.05, 10, 6), INK, { at: [0, 1.1, 0.13], scale: [1, 0.5, 0.6], bone: "head" });
  b.part(new THREE.SphereGeometry(0.075, 10, 6), BONE_D, {
    at: [0, 1.075, 0.12],
    scale: [1, 0.55, 0.75],
    bone: "jaw",
  });
  for (const sx of [1, -1])
    b.part(new THREE.ConeGeometry(0.008, 0.02, 5), BONE, { at: [0.03 * sx, 1.1, 0.163], bone: "jaw" });

  const crown = b.surface(hood).scatter(22, {
    rng: rng(5),
    minDist: 0.035,
    filter: (h) => h.n.y > 0.25 && h.at.z < 0.06,
  });
  b.cards(crown, leaves, {
    size: [0.06, 0.1],
    lean: 35,
    flow: [0, 0.3, -1],
    bend: 25,
    vary: 0.25,
    spin: 25,
    rng: rng(9),
    bone: "head",
  });
  mushroom([-0.12, 1.34, -0.05], [-0.6, 1, -0.2], 1.1, "head");
  mushroom([-0.09, 1.36, -0.09], [-0.3, 1, -0.4], 0.7, "head");

  // ---------- paired limbs ----------
  for (const [s, sx] of [["L", 1], ["R", -1]] as const) {
    const A = (x: number, y: number, z: number) => [x * sx, y, z];

    // antlers
    const ant = { color: BARK_D, bone: "head" };
    b.capsule(A(0.07, 1.33, -0.03), A(0.15, 1.47, -0.06), { radius: [0.022, 0.016], ...ant });
    b.capsule(A(0.15, 1.47, -0.06), A(0.2, 1.62, -0.03), { radius: [0.016, 0.008], ...ant });
    b.capsule(A(0.15, 1.47, -0.06), A(0.26, 1.52, 0.0), { radius: [0.012, 0.006], ...ant });
    b.capsule(A(0.18, 1.55, -0.045), A(0.13, 1.66, -0.02), { radius: [0.01, 0.005], ...ant });
    b.capsule(A(0.11, 1.4, -0.045), A(0.2, 1.42, 0.04), { radius: [0.01, 0.005], ...ant });
    b.cards(
      [
        frame(A(0.2, 1.62, -0.03), [0.3 * sx, 1, 0.1]),
        frame(A(0.26, 1.52, 0.0), [1 * sx, 0.5, 0.2]),
        frame(A(0.13, 1.66, -0.02), [-0.2 * sx, 1, 0.1]),
        frame(A(0.2, 1.42, 0.04), [0.6 * sx, 0.3, 1]),
      ],
      leaves,
      { size: [0.05, 0.09], bend: 20, vary: 0.2, spin: 30, rng: rng(sx > 0 ? 21 : 22), bone: "head" },
    );

    // arm
    const arm = b.chain(`arm${s}`, [A(0.12, 0.93, 0), A(0.32, 0.92, 0), A(0.5, 0.91, 0), A(0.56, 0.91, 0)], {
      parent: "chest",
      names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`],
      role: "arm",
    });
    b.sweep(arm, { radius: [0.05, 0.038, 0.03, 0.03], color: armPaint });
    b.part(new THREE.SphereGeometry(0.075, 10, 7), moss, {
      at: A(0.15, 0.97, 0),
      scale: [1, 0.7, 1],
      bone: `shoulder${s}`,
    });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), BARK_D, { at: A(0.32, 0.92, 0), bone: `elbow${s}` });
    b.ring(frame(A(0.47, 0.912, 0), [sx, 0, 0]), { count: 7, radius: 0.034 }, (item) => {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), GLOW, { at: item.at, bone: `elbow${s}` });
    });
    b.part(new THREE.SphereGeometry(0.045, 10, 7), BARK, {
      at: A(0.555, 0.91, 0),
      scale: [1, 0.6, 1],
      bone: `wrist${s}`,
    });
    const fingerDirs = [
      [1, -0.05, 0.55],
      [1, -0.05, 0],
      [1, -0.05, -0.55],
      [0.4, -0.05, 1],
    ];
    fingerDirs.forEach((fd, i) => {
      const d = new THREE.Vector3(fd[0] * sx, fd[1], fd[2]).normalize();
      const base = new THREE.Vector3(0.575 * sx, 0.91, i === 3 ? 0.03 : 0.028 * (1 - i));
      const len = i === 3 ? 0.06 : 0.09;
      const p1 = base.clone().addScaledVector(d, len / 2);
      const p2 = p1.clone().addScaledVector(d, len / 2).add(new THREE.Vector3(0, -0.008, 0));
      const finger = b.chain(`finger${i + 1}${s}`, [base, p1, p2], {
        parent: `wrist${s}`,
        names: [`finger${i + 1}a${s}`, `finger${i + 1}b${s}`],
        role: "digit",
      });
      b.sweep(finger, { radius: [0.014, 0.011, 0.005], color: BARK_D });
    });

    // leg
    const leg = b.chain(`leg${s}`, [A(0.08, 0.6, 0), A(0.1, 0.33, 0.03), A(0.1, 0.09, 0)], {
      parent: "hips",
      names: [`hip${s}`, `knee${s}`, `ankle${s}`],
      role: "leg",
      contact: A(0.1, 0, 0.04),
    });
    b.sweep(leg, { radius: [0.065, 0.05, 0.045], color: legPaint });
    b.part(new THREE.SphereGeometry(0.05, 9, 6), moss, {
      at: A(0.1, 0.34, 0.055),
      scale: [1.1, 0.9, 0.7],
      bone: `knee${s}`,
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), BARK, {
      at: A(0.1, 0.05, 0.035),
      scale: [0.075, 0.055, 0.12],
      bone: `ankle${s}`,
    });
    for (const dx of [-0.035, 0, 0.035]) {
      b.spike(A(0.1 + dx, 0.04, 0.12), [dx * 3 * sx, -0.2, 1], 0.06, 0.022, {
        color: BARK_D,
        bone: `ankle${s}`,
      });
    }
  }

  // ---------- tail ----------
  b.sweep(tail, { radius: [0.045, 0.035, 0.022, 0.01], color: legPaint });
  const tip = [0, 0.78, -0.37];
  b.cards(
    [
      frame(tip, [0.5, 1, -0.4]),
      frame(tip, [-0.5, 1, -0.4]),
      frame(tip, [0, 1, -0.7]),
      frame(tip, [0, 0.6, -1]),
      frame(tip, [0.3, 0.4, -1]),
    ],
    leaves,
    { size: [0.07, 0.13], bend: 20, vary: 0.2, rng: rng(31), bone: "tail3" },
  );

  // glowing mushrooms on the left shoulder and right foot
  mushroom([0.16, 1.01, 0.01], [0.3, 1, 0.1], 1.0, "shoulderL");
  mushroom([0.19, 1.0, -0.03], [0.6, 1, -0.2], 0.65, "shoulderL");
  mushroom([0.13, 1.0, 0.04], [-0.1, 1, 0.5], 0.55, "shoulderL");
  mushroom([-0.1, 0.095, 0.03], [-0.2, 1, 0.2], 0.8, "ankleR");

  return b.root;
}
```