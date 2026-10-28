```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, paint, cells, noise, svg } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Basalt Lava Golem",
  description: "Hulking cel-shaded lava golem of basalt plates, glowing molten seams, flame crest and a molten core.",
};

const LAVA = "#ff7a1c";
const HOT = "#ffd45a";
const PLATE = cel("#5d5675", "#2f2948");
const BASALT = cel("#4a4560", "#27223c");
const CRACKED = paint((p, n) => {
  const c = cells(p, 0.2, 3);
  const e = c.d2 - c.d1;
  const wob = noise(p, 0.1, 5) * 0.03;
  if (e + wob < 0.03) return HOT;
  if (e + wob < 0.075) return "#ff5a14";
  return BASALT;
});

const eyeTex = svg(
  `<svg viewBox="0 0 64 32"><path d="M2 6 L62 14 L50 28 L8 24 Z" fill="#ffb02a"/><path d="M14 12 L52 16 L46 24 L16 22 Z" fill="#fff3b0"/><ellipse cx="38" cy="19" rx="4" ry="5" fill="#ff4a10"/></svg>`,
  { size: 128 },
);
const flameTex = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 2 C26 22 31 36 28 50 C26 60 6 60 4 50 C1 36 10 26 16 2Z" fill="#ff6a1a"/><path d="M16 22 C22 34 24 42 22 50 C20 57 11 57 10 50 C8 42 13 34 16 22Z" fill="#ffd45a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(11);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 1.3, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 1.3, 0],
      [0, 1.7, 0.04],
      [0, 2.05, 0.08],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.joint("neck", { parent: chest, at: [0, 2.2, 0.1], dir: [0, 1, 0.3], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.32, 0.14], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.3, 0.27], aim: [0, 2.3, 0.5], role: "jaw" });

  // ---- torso and pelvis
  const torso = b.sweep(spine, (t) => [0.4 + 0.2 * t, 0.3 + 0.05 * t], { color: CRACKED, caps: "round" });
  b.part(new THREE.BoxGeometry(0.8, 0.4, 0.55), CRACKED, { bone: hips, at: [0, 1.2, 0] });
  b.part(new THREE.CylinderGeometry(0.3, 0.2, 0.28, 6), PLATE, { bone: neck, at: [0, 2.22, 0.08] });

  // chest plates
  const skin = b.surface(torso);
  for (const h of skin.scatter(34, { rng: R, minDist: 0.2, filter: (h) => h.n.z > 0.2 || Math.abs(h.n.x) > 0.7 }))
    b.stick(new THREE.CylinderGeometry(0.1, 0.12, 0.07, 6), PLATE, h, { embed: 0.3 });

  // molten core with ring of rays
  glow(b.part(new THREE.IcosahedronGeometry(0.15, 1), HOT, { bone: chest, at: [0, 1.85, 0.4] }), 1.6);
  glow(b.part(new THREE.IcosahedronGeometry(0.21, 0), LAVA, { bone: chest, at: [0, 1.85, 0.37] }), 1.1);
  b.ring(frame([0, 1.85, 0.4], [0, 0, 1]), { count: 8, radius: 0.24 }, (it) =>
    b.stick(new THREE.ConeGeometry(0.04, 0.12, 5), PLATE, it, { bone: chest }),
  );

  // back spikes
  for (let i = 0; i < 5; i++) {
    const hit = skin.around([0, 1.7, 0.06]).at(180, 10 + i * 14);
    if (hit) {
      b.stick(new THREE.ConeGeometry(0.1 - i * 0.008, 0.38 - i * 0.03, 5), PLATE, hit, { embed: 0.2 });
      glow(b.stick(new THREE.ConeGeometry(0.05, 0.2, 5), LAVA, hit, { embed: -0.35 }), 1.2);
    }
  }

  // ---- head
  b.part(new THREE.BoxGeometry(0.52, 0.42, 0.46), CRACKED, { bone: head, at: [0, 2.44, 0.2] });
  b.part(new THREE.BoxGeometry(0.58, 0.1, 0.18), PLATE, { bone: head, at: [0, 2.62, 0.38] }); // brow
  b.part(new THREE.BoxGeometry(0.36, 0.12, 0.1), PLATE, { bone: head, at: [0, 2.5, 0.43] }); // nose block
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.PlaneGeometry(0.17, 0.085), "#ffffff", {
        bone: head,
        at: [s * 0.13, 2.53, 0.436],
        dir: [0, 0, 1],
        axis: "z",
        texture: eyeTex,
        rotation: [0, 0, s * -4],
      }),
      1.5,
    );
    b.spike([s * 0.2, 2.62, 0.05], [s * 0.6, 1, -0.25], 0.5, 0.075, { color: PLATE, bone: head });
    glow(b.spike([s * 0.2, 2.62, 0.05], [s * 0.6, 1, -0.25], 0.18, 0.075, { color: LAVA, bone: head, caps: { end: "flat" } }), 1);
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 6), PLATE, { bone: head, at: [s * 0.3, 2.42, 0.18], rotation: [0, 0, 90] }); // ear plate
  }
  // jaw
  b.part(new THREE.BoxGeometry(0.42, 0.12, 0.34), PLATE, { bone: jaw, at: [0, 2.26, 0.34] });
  glow(b.part(new THREE.BoxGeometry(0.34, 0.03, 0.26), HOT, { bone: jaw, at: [0, 2.325, 0.35] }), 1.3);
  for (let i = 0; i < 5; i++)
    b.part(new THREE.ConeGeometry(0.03, 0.08, 4), "#d9d2c4", { bone: jaw, at: [-0.15 + i * 0.075, 2.36, 0.5] });
  // flame crest
  const crest = [0, 1, 2, 3, 4].map((i) => frame([0, 2.64, 0.32 - i * 0.1], [0, 1, 0]));
  glow(
    b.cards(crest, flameTex, { size: [0.22, 0.5], flow: [0, 0, -1], lean: 15, bend: 20, cross: true, vary: 0.25, rng: R, bone: head }),
    1.3,
  );

  // ---- arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.78, 2.0, 0], [s * 0.98, 0.7, 0.3], [0.75, 0.72], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.22, 0.17], { color: CRACKED });
    const hand = pts[2];
    const wrist = arm.tip!;
    b.part(new THREE.BoxGeometry(0.36, 0.34, 0.34), CRACKED, { bone: wrist, at: [hand.x, hand.y - 0.12, hand.z] });
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.ConeGeometry(0.05, 0.14, 5), PLATE, {
        bone: wrist,
        at: [hand.x + k * 0.1, hand.y - 0.05, hand.z + 0.2],
        rotation: [90, 0, 0],
      });
    glow(b.part(new THREE.TorusGeometry(0.17, 0.03, 5, 8), LAVA, { bone: wrist, at: [hand.x, hand.y + 0.08, hand.z], rotation: [90, 0, 0] }), 1.2);
    // pauldron
    b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.26, 6), PLATE, { bone: arm.joints[0], at: [s * 0.84, 2.2, 0], rotation: [0, 0, s * -18] });
    glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), LAVA, { bone: arm.joints[0], at: [s * 0.86, 2.36, 0], rotation: [0, 0, s * -18] }), 1);
    b.stick(new THREE.ConeGeometry(0.08, 0.3, 5), PLATE, { at: [s * 0.9, 2.34, 0], axis: [s * 0.4, 1, 0], bone: arm.joints[0] } as never);
    // elbow plate
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 6), PLATE, { bone: arm.joints[1], at: [pts[1].x + s * 0.12, pts[1].y, pts[1].z - 0.1], rotation: [0, 0, 90] });
  }

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.35, 1.2, 0], [s * 0.38, 0.2, 0.05], [0.55, 0.55], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.24, 0.17], { color: CRACKED });
    const ankle = leg.tip!;
    b.part(new THREE.BoxGeometry(0.32, 0.2, 0.52), CRACKED, { bone: ankle, at: [s * 0.38, 0.1, 0.15] });
    for (let k = -1; k <= 1; k++)
      glow(b.part(new THREE.BoxGeometry(0.07, 0.05, 0.1), LAVA, { bone: ankle, at: [s * 0.38 + k * 0.1, 0.12, 0.42] }), 1.2);
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.14, 6), PLATE, { bone: leg.joints[1], at: [s * 0.37, pts[1].y, pts[1].z + 0.2], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 6), PLATE, { bone: leg.joints[0], at: [s * 0.4, 1.4, 0], rotation: [0, 0, s * 80] });
  }

  // belt of plates
  b.ring(frame([0, 1.4, 0.0], [0, 1, 0]), { count: 10, radius: 0.5 }, (it) =>
    b.stick(new THREE.BoxGeometry(0.14, 0.12, 0.08), PLATE, it, { bone: hips }),
  );

  return b.root;
}
```