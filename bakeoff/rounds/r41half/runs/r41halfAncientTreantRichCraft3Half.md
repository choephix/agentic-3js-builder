```ts
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, limb, mottle, scales, grain, noise, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Ancient Treant",
  description: "A towering, moss-cloaked tree guardian with a leafy crown, glowing amber eyes and a runed heartwood chest.",
};

// Self-lit helper (same method as the glow kit: emissive = own colour / texture).
function lit<T extends { mesh: THREE.Mesh }>(part: T, k = 1): T {
  const m = part.mesh.material as THREE.MeshStandardMaterial;
  const c = m.clone();
  c.emissive.copy(m.color);
  c.emissiveMap = m.map;
  c.emissiveIntensity = k;
  part.mesh.material = c;
  return part;
}

// ---------- palette / paints ----------
const MOSS = mottle("#2f6a28", "#6aa83a", { size: 0.16, seed: 3 });
const PLATES = scales(["#4a2f1d", "#5a3a24", "#6b4629", "#3f281a"], "#1f1209", { size: 0.1, width: 0.2, seed: 2 });
const BARK = paint((p, n) => (n.y > 0.5 && noise(p, 0.28, 4) > 0.42 ? MOSS : PLATES));
const BARK_DK = grain("#2a1a10", "#4a2f1d", { size: 0.03, axis: "y" });
const TWIG = grain("#4a2f1d", "#7d5634", { size: 0.025, axis: "y" });
const LEAFY = mottle("#2a6126", "#5f9c2f", { size: 0.3, seed: 8 });
const HEART = "#e6a63a";
const BONE = "#eadfc2";
const SHROOM = "#d9792b";
const DARK = "#1b0f08";

// ---------- textures ----------
const leafSvg = (a: string, b: string, vein: string) =>
  svg(
    `<svg viewBox="0 0 40 64"><path d="M20 62 C2 44 2 18 20 2 C38 18 38 44 20 62Z" fill="${a}" stroke="#14310f" stroke-width="2.5"/>
    <path d="M20 60 C26 40 26 22 20 6 C14 22 14 40 20 60Z" fill="${b}"/>
    <path d="M20 60 L20 8 M20 40 L9 30 M20 40 L31 30 M20 26 L12 18 M20 26 L28 18" stroke="${vein}" stroke-width="2" fill="none"/></svg>`,
    { size: 128 },
  );
const LEAF = leafSvg("#3b8a2e", "#5fb340", "#1d4a18");
const LEAF2 = leafSvg("#6a9a2a", "#a6c63e", "#3a5a14");
const LEAF3 = leafSvg("#c9792a", "#e8b040", "#7a3a10");
const TUFT = svg(
  `<svg viewBox="0 0 48 64"><path d="M4 62 C6 40 10 20 14 4 C20 24 22 44 24 62Z M18 62 C22 30 30 14 36 2 C38 26 36 46 40 62Z M10 62 C16 44 28 34 44 22 C42 42 36 54 34 62Z" fill="#4f9a34" stroke="#1d4a18" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);
const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M2 6 C20 2 48 12 62 30 C40 38 12 30 2 6Z" fill="#150a04" stroke="#150a04" stroke-width="3"/>
  <path d="M10 10 C24 8 42 16 54 28 C38 30 20 24 10 10Z" fill="#ff9a1a"/>
  <path d="M22 13 C32 14 40 19 46 26 C36 26 28 21 22 13Z" fill="#fff1a0"/>
  <ellipse cx="34" cy="20" rx="3" ry="6" fill="#3a1500" transform="rotate(-35 34 20)"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 80"><ellipse cx="32" cy="40" rx="28" ry="37" fill="#1a0f08" stroke="#3a2412" stroke-width="4"/>
  <ellipse cx="32" cy="40" rx="22" ry="31" fill="none" stroke="#8dff6a" stroke-width="3"/>
  <path d="M32 14 L32 66 M32 30 L18 20 M32 30 L46 20 M32 46 L16 56 M32 46 L48 56 M20 38 L44 38" stroke="#b6ff8a" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <circle cx="32" cy="40" r="5" fill="#eaffc0"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "treant" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.7, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 1.7, 0], [0, 2.2, 0], [0, 2.7, 0.05], [0, 3.1, 0.12]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const head = b.joint("head", { parent: chest, at: [0, 3.25, 0.18], aim: [0, 3.55, 0.3], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.3, 0.3], aim: [0, 3.28, 0.75], role: "jaw" });

  // ---------- torso ----------
  const torso = b.loft(
    [
      { at: [0, 1.65, 0], w: 0.95, h: 0.75 },
      { at: [0, 2.1, 0], w: 1.05, h: 0.85 },
      { at: [0, 2.6, 0.05], w: 1.45, h: 1.0 },
      { at: [0, 3.0, 0.1], w: 1.15, h: 0.85 },
      { at: [0, 3.28, 0.18], w: 0.7, h: 0.6 },
    ],
    { bone: spine, color: BARK },
  );
  const skin = b.surface(torso);

  // heartwood rune + hollow
  lit(
    b.decal(torso, RUNE, { at: [0, 2.45, 0.6], dir: [0, 0, 1], size: [0.5, 0.62], lift: 0.004 }),
    1.3,
  );
  // vine with berries around the belly
  const vineLoop = skin.loop([0, 2.0, 0.0], { lift: 0.03 });
  b.sweep(vineLoop, 0.04, { color: "#356b24", bone: spine.joints[1], sides: 6 });
  b.along(skin.loop([0, 2.0, 0.0], { lift: 0.06 }), 12, (at: any) =>
    b.part(new THREE.SphereGeometry(0.035, 6, 4), "#c8372d", { at, bone: spine.joints[1] }),
  );
  // shelf fungi
  for (const h of skin.scatter(9, { rng: rng(4), minDist: 0.28, filter: (h: any) => Math.abs(h.n.y) < 0.4 && h.at.y > 1.9 && h.at.y < 3 })) {
    b.stick(new THREE.CylinderGeometry(0.14, 0.1, 0.045, 8), SHROOM, h, { embed: 0.4, flow: [0, 1, 0] });
  }
  // back moss cloak tufts
  const tuftHits = skin.scatter(40, { rng: rng(6), minDist: 0.12, filter: (h: any) => h.n.y > 0.1 || (h.n.z < -0.3 && h.at.y > 2) });
  b.cards(tuftHits, TUFT, { size: [0.14, 0.2], lean: 25, vary: 0.35, spin: 180, rng: rng(7), cross: true });

  // roots skirt
  const skirt = b.ring(frame([0, 1.65, 0], [0, 1, 0]), { count: 12, radius: 0.5 }, (it: any) => {
    const o = it.outward;
    b.spike(it.at, [o.x * 0.5, -1, o.z * 0.5], 0.55, 0.08, { color: BARK_DK, bone: hips, sides: 6 });
  });
  void skirt;

  // ---------- legs ----------
  const leafFrames: any[] = [];
  const leaves = (path: any, n: number) => {
    b.along(path, n, (at: any) => {
      leafFrames.push(at);
    });
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.42, 1.65, 0], [s * 0.46, 0.22, 0.1], [0.85, 0.8], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.32, 0.22], { color: BARK });
    const knee = leg.joints[1];
    b.part(new THREE.IcosahedronGeometry(0.26, 0), BARK_DK, { bone: knee, at: [s * 0.47, 0.95, 0.38], flat: true });
    b.part(new THREE.BoxGeometry(0.55, 0.18, 0.75), BARK_DK, { bone: leg.tip!, at: [s * 0.47, 0.09, 0.16] });
    for (let t = -1; t <= 1; t++) {
      b.spike([s * 0.47 + t * 0.17, 0.12, 0.45], [t * 0.25, -0.05, 1], 0.4, 0.09, { color: TWIG, bone: leg.tip!, sides: 6 });
    }
    for (const k of [-1, 1]) {
      b.spike([s * 0.47 + k * 0.15, 0.14, -0.1], [k * 0.7 + s * 0.4, -0.12, -1], 0.55, 0.07, { color: BARK_DK, bone: leg.tip!, sides: 6 });
    }

    // ---------- arms ----------
    const sh: [number, number, number] = [s * 0.85, 2.85, 0];
    const arm = b.chain(`arm${S}`, polyline([sh, [s * 1.25, 2.0, 0.12], [s * 1.4, 1.2, 0.32]]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const armSweep = b.sweep(arm, (t: number) => 0.3 - 0.07 * t, { color: BARK });
    const wrist = arm.tip!;
    // shoulder moss burl
    const pad = b.part(new THREE.SphereGeometry(1, 8, 6), MOSS, {
      bone: arm.joints[0], at: [s * 0.9, 3.0, 0], scale: [0.44, 0.34, 0.42], flat: true,
    });
    b.cards(b.surface(pad).scatter(10, { rng: rng(20 + s), minDist: 0.15 }), TUFT, {
      size: [0.14, 0.22], lean: 20, vary: 0.3, spin: 180, rng: rng(9), cross: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.2, 0), BARK_DK, { bone: arm.joints[1], at: [s * 1.3, 2.0, 0.2], flat: true });
    b.along(armSweep, 3, (at: any) => {
      b.spike(at, at, 0.32, 0.04, { color: TWIG, sides: 5 });
      leafFrames.push(at);
    });
    // hand
    b.part(new THREE.SphereGeometry(1, 8, 6), BARK_DK, { bone: wrist, at: [s * 1.42, 1.1, 0.34], scale: [0.2, 0.16, 0.15], flat: true });
    for (let i = 0; i < 4; i++) {
      const dx = s * (1.42 + (i - 1.5) * 0.08);
      const dz = 0.34 + (i % 2) * 0.03;
      const f = b.chain(
        `finger${i}${S}`,
        polyline([[dx, 1.05, dz], [dx + (i - 1.5) * 0.02, 0.75, dz + 0.05], [dx + (i - 1.5) * 0.05, 0.5, dz + 0.14]]),
        { parent: wrist, names: [`f${i}a${S}`, `f${i}b${S}`], role: "digit" },
      );
      b.sweep(f, [0.06, 0.02], { color: TWIG, sides: 6, caps: { end: "point" } });
    }
    const th = b.chain(`thumb${S}`, polyline([[s * 1.32, 1.1, 0.4], [s * 1.2, 0.9, 0.5], [s * 1.12, 0.72, 0.58]]), {
      parent: wrist, names: [`t1${S}`, `t2${S}`], role: "digit",
    });
    b.sweep(th, [0.055, 0.02], { color: TWIG, sides: 6, caps: { end: "point" } });

    // brows + eyes
    b.part(new THREE.BoxGeometry(0.32, 0.1, 0.2), BARK_DK, { bone: head, at: [s * 0.2, 3.77, 0.68], rotation: [0, 0, s * 18] });
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), BARK, {
    bone: head, at: [0, 3.6, 0.3], scale: [0.5, 0.48, 0.46],
  });
  b.part(new THREE.BoxGeometry(0.52, 0.2, 0.42), BARK_DK, { bone: head, at: [0, 3.4, 0.55] }); // upper jaw
  b.part(new THREE.BoxGeometry(0.4, 0.06, 0.36), DARK, { bone: head, at: [0, 3.3, 0.5] }); // mouth inside
  b.part(new THREE.ConeGeometry(0.11, 0.32, 6), BARK, { bone: head, at: [0, 3.48, 0.86], dir: [0, -0.25, 1] });
  b.part(new THREE.BoxGeometry(0.52, 0.14, 0.44), BARK_DK, { bone: jaw, at: [0, 3.2, 0.52] }); // lower jaw
  for (const s of [1, -1]) {
    b.spike([s * 0.2, 3.23, 0.72], [0, 1, 0.1], 0.26, 0.05, { color: BONE, bone: jaw, sides: 6 });
    b.spike([s * 0.14, 3.3, 0.72], [0, -1, 0], 0.12, 0.03, { color: BONE, bone: head, sides: 6 });
    lit(
      b.decal(skull, EYE, { at: [s * 0.19, 3.63, 0.8], dir: [0, 0, 1], size: [0.22, 0.14], mirror: s > 0, lift: 0.004 }),
      1.5,
    );
    // cheek burls
    b.part(new THREE.IcosahedronGeometry(0.1, 0), BARK, { bone: head, at: [s * 0.4, 3.45, 0.45], flat: true });
  }
  // moss beard
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.075;
    const len = 0.7 - Math.abs(i - 3) * 0.1;
    b.sweep(catmull([[x, 3.16, 0.7], [x * 1.4, 3.16 - len * 0.5, 0.78], [x * 1.7, 3.16 - len, 0.74]]), [0.065, 0.01], {
      color: i % 2 ? MOSS : "#3f7a2c", bone: jaw, sides: 5,
    });
  }

  // ---------- crown ----------
  const blobs: any[] = [];
  const blobAt = (x: number, y: number, z: number, r: number) =>
    blobs.push(b.part(new THREE.IcosahedronGeometry(r, 1), LEAFY, { bone: head, at: [x, y, z], flat: true }));
  blobAt(0, 4.35, -0.2, 0.7);
  blobAt(0.65, 4.1, -0.2, 0.5);
  blobAt(-0.65, 4.1, -0.2, 0.5);
  blobAt(0, 4.05, -0.5, 0.55);
  blobAt(0.4, 4.7, -0.1, 0.4);
  blobAt(-0.4, 4.7, -0.1, 0.4);
  const crownHits = b.surface(blobs).scatter(70, { rng: rng(13), minDist: 0.13, filter: (h: any) => h.n.y > -0.2 });
  b.cards(crownHits, [LEAF, LEAF2, LEAF, LEAF3], { size: [0.3, 0.4], lean: 45, vary: 0.3, spin: 180, rng: rng(14), flow: [0, 0.3, -1] });

  // antler branches
  const branch = (pts: number[][], r: number, n: number) => {
    const path = catmull(pts);
    b.sweep(path, [r, 0.015], { color: TWIG, bone: head, sides: 6 });
    leaves(path, n);
  };
  for (const s of [1, -1]) {
    branch([[s * 0.22, 3.95, 0.2], [s * 0.55, 4.3, 0.2], [s * 0.85, 4.8, 0.1], [s * 0.8, 5.25, 0.05]], 0.1, 5);
    branch([[s * 0.5, 4.25, 0.2], [s * 1.0, 4.4, 0.25], [s * 1.35, 4.75, 0.3]], 0.06, 4);
    branch([[s * 0.8, 4.75, 0.1], [s * 0.45, 5.1, 0.0], [s * 0.3, 5.5, -0.05]], 0.05, 3);
  }
  branch([[0, 3.98, 0.1], [0.05, 4.5, -0.05], [0, 5.1, -0.1], [0.05, 5.55, -0.1]], 0.1, 5);

  b.cards(leafFrames, [LEAF, LEAF2, LEAF, LEAF3], {
    size: [0.28, 0.38], lean: 50, vary: 0.3, spin: 180, rng: rng(15), flow: [0, 0.2, -1],
  });
  void R;

  return b.root;
}
```