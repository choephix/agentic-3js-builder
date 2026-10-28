```ts
import * as THREE from "three";
import { catmull, cells, createBuilder, limb, mix, paint, rng, smoothstep, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Lava Golem",
  description: "A stout basalt golem with molten seams, glowing slit eyes and a lava core in its chest.",
};

// Scale constants: one per feature, so a feature's parts stay together while tuning.
const H = 1.0; // head scale
const T = 1.0; // torso scale
const L = 1.0; // limb scale

// Palette: a dark basalt that cracks into molten seams, cel-shaded for the anime read.
const ROCK = paint((p, n) => {
  const c = cells(p, 0.28, 4);
  const seam = c.d2 - c.d1;
  if (seam < 0.045) return mix("#ffd25a", "#ff6a14", smoothstep(0.02, 0.045, seam));
  const shade = 0.55 * c.id + 0.45 * smoothstep(-0.4, 0.9, n.y);
  return mix("#2a2632", "#5b5468", shade);
});
const STONE = cel(ROCK, "#17131e");
const MOLTEN = "#ff7a1c";
const CORE = "#ffc24a";
const DARK = "#141019";

// Slit eyes: a drawn molten iris with a black slit pupil and a hard outline.
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 20 Q32 -4 61 20 Q32 44 3 20Z" fill="#120402"/>
    <path d="M7 20 Q32 2 57 20 Q32 38 7 20Z" fill="#ffd060"/>
    <path d="M7 20 Q32 9 57 20 Q32 30 7 20Z" fill="#ff8a1c"/>
    <ellipse cx="32" cy="20" rx="4.2" ry="13" fill="#1a0500"/>
    <ellipse cx="27" cy="15" rx="3" ry="2" fill="#fff6d0"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "lava-golem" });

  // ----- Skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.12 * T, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.1 * T, 0],
      [0, 1.5 * T, 0.02],
      [0, 1.9 * T, 0],
    ]),
    { parent: hips, names: ["spine1", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: chest, at: [0, 2.05 * H, 0.04], aim: [0, 2.4 * H, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.93 * H, 0.1], role: "jaw" });

  // Legs: planted feet, knees bend forward.
  const legs = [1, -1].map((s) => {
    const sd = s > 0 ? "L" : "R";
    const pts = limb([s * 0.36, 1.1, 0], [s * 0.38, 0.16, 0.04], [0.56 * L, 0.5 * L], [0, 0, 1]);
    const leg = b.chain(`leg${sd}`, pts, { parent: hips, names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`], role: "leg" });
    return { s, sd, leg };
  });

  // Arms: heavy, elbows bend back, fists hang forward.
  const arms = [1, -1].map((s) => {
    const sd = s > 0 ? "L" : "R";
    const pts = limb([s * 0.62, 1.82, 0], [s * 0.78, 1.0, 0.28], [0.5 * L, 0.45 * L], [0, 0, -1]);
    const arm = b.chain(`arm${sd}`, pts, { parent: chest, names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`], role: "arm" });
    return { s, sd, arm };
  });

  // ----- Torso: a stacked basalt column ---------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 1.02 * T, 0], w: 0.6, h: 0.5 },
      { at: [0, 1.5 * T, 0], w: 0.8, h: 0.62 },
      { at: [0, 1.92 * T, 0], w: 0.64, h: 0.5 },
    ],
    { bone: spine, color: STONE },
  );

  // Hips block and a belt of molten seams.
  b.part(new THREE.BoxGeometry(0.66, 0.3, 0.44), STONE, { bone: hips, at: [0, 1.1 * T, 0], flat: true });
  for (const x of [-0.2, 0.2]) {
    glow(b.part(new THREE.BoxGeometry(0.04, 0.22, 0.02), MOLTEN, { bone: hips, at: [x, 1.1 * T, 0.23] }), 1.2);
  }

  // Chest: a glowing lava core inside a cracked ring of stone.
  b.part(new THREE.IcosahedronGeometry(0.16, 0), DARK, { bone: chest, at: [0, 1.58 * T, 0.33] });
  glow(b.part(new THREE.IcosahedronGeometry(0.12, 0), CORE, { bone: chest, at: [0, 1.58 * T, 0.37] }), 1.8);
  for (const x of [-0.24, 0, 0.24]) {
    glow(b.part(new THREE.BoxGeometry(0.035, 0.42, 0.02), MOLTEN, { bone: chest, at: [x, 1.5 * T, 0.33] }), 1.4);
  }

  // Plates: chunky basalt slabs scattered over the torso, sized and sunk by the rng.
  const r = rng(7);
  const torsoSkin = b.surface(torso);
  for (const hit of torsoSkin.scatter(38, { rng: rng(7), minDist: 0.2, filter: (h) => h.n.y > -0.5 })) {
    const w = 0.14 + 0.1 * r();
    const hgt = 0.12 + 0.08 * r();
    b.stick(new THREE.BoxGeometry(w, hgt, 0.07), STONE, hit, { embed: 0.35, flow: [0, 1, 0] });
  }

  // ----- Head -------------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.BoxGeometry(0.46 * H, 0.42 * H, 0.44 * H), STONE, {
    bone: head,
    at: [0, 2.05 * H, 0.04],
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.52 * H, 0.07 * H, 0.2 * H), DARK, {
    bone: head,
    at: [0, 2.2 * H, 0.2],
    flat: true,
  });

  // Horns: two swept-back basalt spikes.
  for (const s of [1, -1]) {
    b.spike([s * 0.18, 2.3 * H, 0.02], [s * 0.25, 0.9, -0.25], 0.36 * H, 0.085 * H, { bone: head, color: DARK });
  }

  // Eyes: drawn slits, decaled onto the front of the skull and lit.
  for (const s of [1, -1]) {
    glow(
      b.decal(skull, EYE, {
        at: [s * 0.11 * H, 2.1 * H, 0.27 * H],
        dir: [0, 0, 1],
        size: [0.13 * H, 0.08 * H],
        mirror: s > 0,
      }),
      1.5,
    );
  }

  // Jaw: a lower block under a glowing mouth.
  b.part(new THREE.BoxGeometry(0.34 * H, 0.1 * H, 0.3 * H), STONE, { bone: jaw, at: [0, 1.93 * H, 0.12], flat: true });
  glow(b.part(new THREE.BoxGeometry(0.28 * H, 0.04 * H, 0.16 * H), MOLTEN, { bone: head, at: [0, 1.99 * H, 0.22] }), 1.3);

  // ----- Limbs --------------------------------------------------------------------------------------------------------
  for (const { leg, s } of legs) {
    b.sweep(leg, [0.16 * L, 0.12 * L], { color: STONE });
    const foot = leg.joints[leg.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.3, 0.32, 0.46), STONE, {
      bone: foot,
      at: [s * 0.38, 0.16, 0.14],
      flat: true,
    });
    // Molten seam across each knee.
    const knee = leg.joints[1];
    glow(b.part(new THREE.BoxGeometry(0.22, 0.03, 0.22), MOLTEN, { bone: knee, at: knee.at }), 1.2);
  }

  for (const { arm, s } of arms) {
    b.sweep(arm, [0.12, 0.09], { color: STONE });
    // Shoulder pauldron.
    b.part(new THREE.BoxGeometry(0.3, 0.26, 0.32), STONE, {
      bone: arm.joints[0],
      at: [s * 0.62, 1.84 * T, 0],
      flat: true,
    });
    // Fist: a chunky block with a glowing knuckle seam.
    const hand = arm.joints[arm.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.28, 0.26, 0.26), STONE, { bone: hand, at: hand.at, flat: true });
    glow(b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), MOLTEN, { bone: hand, at: [hand.at.x, hand.at.y, hand.at.z + 0.14] }), 1.2);
  }

  return b.root;
}
```